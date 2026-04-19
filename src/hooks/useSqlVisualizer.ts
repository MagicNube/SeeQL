import { useState, useEffect } from 'react';
import { Parser } from 'node-sql-parser';

export interface JoinDetails {
  type: string;
  leftTable: string;
  rightTable: string;
  leftColumn: string;
  rightColumn: string;
}

export interface SelectedColumn {
  table: string | null;
  column: string;
}

export interface OrderByDetails {
  column: string;
  direction: 'ASC' | 'DESC';
}

export interface Aggregation {
  func: string;
  column: string;
  raw: string;
}

const resolveColumn = (row: any, column: string, table?: string) => {
  if (table) return row[`${table}.${column}`];
  if (row[column] !== undefined) return row[column];

  const matches = Object.keys(row).filter(k =>
    k.toLowerCase().endsWith(`.${column.toLowerCase()}`) || k.toLowerCase() === column.toLowerCase()
  );

  if (matches.length === 1) return row[matches[0]];
  return undefined;
};

export const evaluateWhere = (row: any, ast: any): boolean => {
  if (!ast) return true;

  // Manejo de valores literales y referencias a columnas
  if (ast.type === 'column_ref') {
    const val = resolveColumn(row, ast.column, ast.table);
    return val !== undefined ? val : false;
  }

  if (ast.type === 'bool' || ast.type === 'boolean') {
    return ast.value;
  }

  if (ast.type === 'binary_expr') {
    const { left, right, operator } = ast;

    // RECURSIVIDAD LÓGICA: Evaluamos ramas completas antes de aplicar AND/OR
    if (operator === 'AND') {
      return evaluateWhere(row, left) && evaluateWhere(row, right);
    }
    if (operator === 'OR') {
      return evaluateWhere(row, left) || evaluateWhere(row, right);
    }

    // COMPARACIÓN ESTÁNDAR: Resolvemos valores finales
    const resolveValue = (node: any) => {
      if (!node) return undefined;
      if (node.type === 'column_ref') return resolveColumn(row, node.column, node.table);
      if (node.type === 'number' || node.type === 'string' || node.type === 'single_quote_string') return node.value;
      return node.value;
    };

    const leftVal = resolveValue(left);
    const rightVal = resolveValue(right);

    // Si la columna no existe en esta fila, no podemos comparar
    if (leftVal === undefined && left.type === 'column_ref') return false;

    switch (operator) {
      case '=': return String(leftVal).toLowerCase() === String(rightVal).toLowerCase();
      case '>': return Number(leftVal) > Number(rightVal);
      case '<': return Number(leftVal) < Number(rightVal);
      case '>=': return Number(leftVal) >= Number(rightVal);
      case '<=': return Number(leftVal) <= Number(rightVal);
      case '!=':
      case '<>': return String(leftVal).toLowerCase() !== String(rightVal).toLowerCase();
      case 'LIKE':
        const regex = String(rightVal).replace(/%/g, '.*');
        return new RegExp(`^${regex}$`, 'i').test(String(leftVal));
      default: return true;
    }
  }

  return true;
};

export const useSqlVisualizer = (query: string) => {
  const [activeTables, setActiveTables] = useState<string[]>([]);
  const [whereAST, setWhereAST] = useState<any>(null);
  const [joinDetails, setJoinDetails] = useState<JoinDetails | null>(null);
  const [selectedColumns, setSelectedColumns] = useState<SelectedColumn[]>([]);
  const [isSelectAll, setIsSelectAll] = useState<boolean>(false);
  const [orderBy, setOrderBy] = useState<OrderByDetails | null>(null);
  const [groupBy, setGroupBy] = useState<string[]>([]);
  const [aggregations, setAggregations] = useState<Aggregation[]>([]);
  const [havingAST, setHavingAST] = useState<any>(null);

  // NUEVO ESTADO PARA LIMIT
  const [limit, setLimit] = useState<number | null>(null);

  useEffect(() => {
    const cleanQuery = query.trim().replace(/;+$/, '');

    if (!cleanQuery) {
      setActiveTables([]); setWhereAST(null); setJoinDetails(null);
      setSelectedColumns([]); setIsSelectAll(true); setOrderBy(null);
      setGroupBy([]); setAggregations([]); setHavingAST(null); setLimit(null);
      return;
    }

    const parsedTables: string[] = [];
    let parsedSelectedCols: SelectedColumn[] = [];
    let isAll = false;
    let parsedJoin: JoinDetails | null = null;
    let currentMainTable = '';

    const fromMatch = cleanQuery.match(/FROM\s+([a-zA-Z0-9_]+)/i);
    if (fromMatch) {
      currentMainTable = fromMatch[1];
      parsedTables.push(currentMainTable);
    }

    const joinTableRegex = /(?:JOIN)\s+([a-zA-Z0-9_]+)/gi;
    let jMatch;
    while ((jMatch = joinTableRegex.exec(cleanQuery)) !== null) {
      if (!parsedTables.includes(jMatch[1])) parsedTables.push(jMatch[1]);
    }

    const selectMatch = cleanQuery.match(/SELECT\s+([\s\S]*?)(?:\s+FROM|$)/i);
    let parsedAggregations: Aggregation[] = [];
    if (selectMatch && currentMainTable) {
      const colString = selectMatch[1].trim();
      if (colString === '*' || colString.includes('.*')) isAll = true;
      else {
        const cols = colString.split(',').map(c => c.trim()).filter(Boolean);
        cols.forEach(c => {
          const colClean = c.split(/\s+AS\s+/i)[0].trim().replace(/[\r\n]+/g, '').replace(/\s+/g, ' ');
          if (colClean === '*') isAll = true;
          else {
            const parts = colClean.split('.');
            if (parts.length === 2) parsedSelectedCols.push({ table: parts[0], column: parts[1] });
            else if (parts.length === 1) parsedSelectedCols.push({ table: null, column: parts[0] });
          }
        });

        const aggrRegex = /(COUNT|SUM|AVG|MAX|MIN)\s*\(\s*([a-zA-Z0-9_.*]+)\s*\)/gi;
        let match;
        while ((match = aggrRegex.exec(colString)) !== null) {
             const colName = match[2].split('.')[1] || match[2];
             parsedAggregations.push({
                 func: match[1].toUpperCase(),
                 column: colName,
                 raw: `${match[1].toUpperCase()}(${match[2]})`
             });
        }
      }
    }

    const joinConditionRegex = /(LEFT\s+JOIN|INNER\s+JOIN|JOIN)\s+([a-zA-Z0-9_]+)\s+ON\s+([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)\s*=\s*([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)/i;
    const jm = cleanQuery.match(joinConditionRegex);
    if (jm && currentMainTable) {
      const joinType = jm[1].toUpperCase().includes('LEFT') ? 'LEFT JOIN' : 'INNER JOIN';
      const rightTable = jm[2];
      const lCol = jm[3].toLowerCase() === currentMainTable.toLowerCase() ? jm[4] : jm[6];
      const rCol = jm[3].toLowerCase() === currentMainTable.toLowerCase() ? jm[6] : jm[4];
      parsedJoin = { type: joinType, leftTable: currentMainTable, rightTable, leftColumn: lCol, rightColumn: rCol };
    }

    const orderByMatch = cleanQuery.match(/ORDER\s+BY\s+([a-zA-Z0-9_.]+)(?:\s+(ASC|DESC))?/i);
    let parsedOrderBy: OrderByDetails | null = null;
    if (orderByMatch) {
      parsedOrderBy = { column: orderByMatch[1], direction: (orderByMatch[2]?.toUpperCase() as 'ASC' | 'DESC') || 'ASC' };
    }

    let parsedGroupBy: string[] = [];
    const groupByMatch = cleanQuery.match(/GROUP\s+BY\s+([a-zA-Z0-9_.,\s]+)(?:\s+HAVING|\s+ORDER|\s+LIMIT|$)/i);
    if (groupByMatch) {
       parsedGroupBy = groupByMatch[1].split(',').map(s => s.trim().split('.')[1] || s.trim());
    }

    // NUEVO: PARSEAR LIMIT
    const limitMatch = cleanQuery.match(/LIMIT\s+(\d+)/i);
    let parsedLimit: number | null = null;
    if (limitMatch) {
      parsedLimit = parseInt(limitMatch[1], 10);
    }

    let parsedHavingAST: any = null;

    try {
      const parser = new Parser();
      const ast = parser.astify(cleanQuery);
      const astArray = Array.isArray(ast) ? ast : [ast];
      astArray.forEach((stmt: any) => {
        if (stmt.type === 'select') {
          if (stmt.where) setWhereAST(stmt.where);
          if (stmt.columns === '*') isAll = true;
          if (stmt.having) parsedHavingAST = stmt.having;
        }
      });
    } catch (e) {}

    setActiveTables(parsedTables); setSelectedColumns(parsedSelectedCols);
    setIsSelectAll(isAll); setJoinDetails(parsedJoin); setOrderBy(parsedOrderBy);
    setGroupBy(parsedGroupBy); setAggregations(parsedAggregations); setHavingAST(parsedHavingAST);
    setLimit(parsedLimit); // Guardamos el limit en el estado
  }, [query]);

  return { activeTables, whereAST, joinDetails, selectedColumns, isSelectAll, orderBy, groupBy, aggregations, havingAST, limit };
};
