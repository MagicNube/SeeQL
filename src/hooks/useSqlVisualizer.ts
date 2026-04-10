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

const resolveColumn = (row: any, column: string, table?: string) => {
  if (table) return row[`${table}.${column}`];

  const matches = Object.keys(row).filter(k =>
    k.toLowerCase().endsWith(`.${column.toLowerCase()}`) || k.toLowerCase() === column.toLowerCase()
  );

  if (matches.length === 1) return row[matches[0]];
  return undefined;
};

export const evaluateWhere = (row: any, ast: any): boolean => {
  if (!ast) return true;

  if (ast.type === 'binary_expr') {
    let leftValue;
    if (ast.left.type === 'column_ref') {
      leftValue = resolveColumn(row, ast.left.column, ast.left.table);
    } else {
      leftValue = ast.left.value;
    }

    let rightValue;
    if (ast.right.type === 'column_ref') {
      rightValue = resolveColumn(row, ast.right.column, ast.right.table);
    } else {
      rightValue = ast.right.value;
    }

    const op = ast.operator;
    if (leftValue === undefined || rightValue === undefined) return true;

    switch (op) {
      case '=': return String(leftValue).toLowerCase() === String(rightValue).toLowerCase();
      case '>': return Number(leftValue) > Number(rightValue);
      case '<': return Number(leftValue) < Number(rightValue);
      case '>=': return Number(leftValue) >= Number(rightValue);
      case '<=': return Number(leftValue) <= Number(rightValue);
      case '!=': return String(leftValue).toLowerCase() !== String(rightValue).toLowerCase();
      case 'LIKE':
        const regexStr = String(rightValue).replace(/%/g, '.*');
        return new RegExp(`^${regexStr}$`, 'i').test(String(leftValue));
      case 'AND': return evaluateWhere(row, ast.left) && evaluateWhere(row, ast.right);
      case 'OR': return evaluateWhere(row, ast.left) || evaluateWhere(row, ast.right);
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

  useEffect(() => {
    const cleanQuery = query.trim().replace(/;+$/, '');

    if (!cleanQuery) {
      setActiveTables([]);
      setWhereAST(null);
      setJoinDetails(null);
      setSelectedColumns([]);
      setIsSelectAll(true);
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
    if (selectMatch && currentMainTable) {
      const colString = selectMatch[1].trim();
      if (colString === '*' || colString.includes('.*')) {
        isAll = true;
      } else {
        const cols = colString.split(',').map(c => c.trim()).filter(Boolean);
        cols.forEach(c => {
          const colClean = c.split(/\s+AS\s+/i)[0].trim().replace(/[\r\n]+/g, '').replace(/\s+/g, ' ');
          if (colClean === '*') {
            isAll = true;
          } else {
            const parts = colClean.split('.');
            if (parts.length === 2) {
              parsedSelectedCols.push({ table: parts[0], column: parts[1] });
            } else if (parts.length === 1) {
              parsedSelectedCols.push({ table: null, column: parts[0] });
            }
          }
        });
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

    try {
      const parser = new Parser();
      const ast = parser.astify(cleanQuery);
      const astArray = Array.isArray(ast) ? ast : [ast];
      astArray.forEach((stmt: any) => {
        if (stmt.type === 'select') {
          if (stmt.where) setWhereAST(stmt.where);
          if (stmt.columns === '*') isAll = true;
        }
      });
    } catch (e) {}

    setActiveTables(parsedTables);
    setSelectedColumns(parsedSelectedCols);
    setIsSelectAll(isAll);
    setJoinDetails(parsedJoin);
  }, [query]);

  return { activeTables, whereAST, joinDetails, selectedColumns, isSelectAll };
};
