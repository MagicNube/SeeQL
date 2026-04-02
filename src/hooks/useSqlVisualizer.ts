import { useState, useEffect } from 'react';
import { Parser } from 'node-sql-parser';

export const evaluateWhere = (row: any, ast: any): boolean => {
  if (!ast) return true;

  if (ast.type === 'binary_expr') {
    const left = ast.left.type === 'column_ref' ? row[ast.left.column] : ast.left.value;
    const right = ast.right.type === 'column_ref' ? row[ast.right.column] : ast.right.value;
    const op = ast.operator;

    switch (op) {
      case '=': return left == right;
      case '>': return Number(left) > Number(right);
      case '<': return Number(left) < Number(right);
      case '>=': return Number(left) >= Number(right);
      case '<=': return Number(left) <= Number(right);
      case '!=': return left != right;
      case 'LIKE':
        const regexStr = String(right).replace(/%/g, '.*');
        return new RegExp(`^${regexStr}$`, 'i').test(String(left));
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

  useEffect(() => {
    if (!query.trim()) {
      setActiveTables([]);
      setWhereAST(null);
      return;
    }

    const parser = new Parser();
    try {
      const ast = parser.astify(query);
      const astArray = Array.isArray(ast) ? ast : [ast];

      const parsedTables: string[] = [];
      let parsedWhere: any = null;

      astArray.forEach((statement: any) => {
        if (statement.type === 'select') {
          if (statement.from) {
            statement.from.forEach((f: any) => {
              parsedTables.push(f.table);
            });
          }
          if (statement.where) {
            parsedWhere = statement.where;
          }
        }
      });

      setActiveTables(parsedTables);
      setWhereAST(parsedWhere);
    } catch (error) {
    }
  }, [query]);

  return { activeTables, whereAST };
};
