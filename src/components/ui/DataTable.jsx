import React from 'react';
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Paper,
  Box,
  Typography
} from '@mui/material';
import SkeletonBlock from './SkeletonBlock';
import EmptyState from './EmptyState';

/**
 * DataTable
 * Standard table container with sticky header, pagination, loading skeletons, and internal horizontal scroll.
 */
export default function DataTable({
  columns = [],
  rows,
  data,
  loading = false,
  isLoading = false,
  keyField,
  keyExtractor,
  emptyTitle = 'No data available',
  emptyDescription = 'There are no records matching your current filters.',
  page = 0,
  rowsPerPage = 10,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [10, 25, 50],
  renderRow,
  maxHeight = 'calc(100vh - 280px)',
  sx = {}
}) {
  const tableRows = rows !== undefined ? (rows || []) : (data || []);
  const isTableLoading = Boolean(loading || isLoading);
  const count = totalCount !== undefined ? totalCount : tableRows.length;

  const getKey = (row, idx) => {
    if (keyField && row && row[keyField] !== undefined) return row[keyField];
    if (typeof keyExtractor === 'function') return keyExtractor(row, idx);
    return row?.id ?? row?.code ?? idx;
  };

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '12px',
        bgcolor: 'background.paper',
        ...sx
      }}
    >
      <TableContainer sx={{ maxHeight, overflowX: 'auto' }}>
        <Table stickyHeader size="small" aria-label="admin data table">
          <TableHead>
            <TableRow>
              {columns.map((col, idx) => {
                const headerText = col.label ?? col.headerName ?? col.title ?? col.name ?? '';
                const headerKey = col.id ?? col.field ?? idx;
                return (
                  <TableCell
                    key={headerKey}
                    align={col.align || 'left'}
                    sx={{
                      width: col.width,
                      minWidth: col.minWidth || 100,
                      fontWeight: 700,
                      fontSize: '11px',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: 'text.secondary',
                      bgcolor: 'background.default',
                      borderBottom: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    {headerText}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>

          <TableBody>
            {isTableLoading ? (
              Array.from({ length: 5 }).map((_, rowIdx) => (
                <TableRow key={rowIdx}>
                  {columns.map((col, colIdx) => (
                    <TableCell key={colIdx} align={col.align || 'left'}>
                      <SkeletonBlock height={20} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : tableRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} sx={{ py: 6, textAlign: 'center' }}>
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </TableCell>
              </TableRow>
            ) : (
              tableRows.map((row, rowIdx) => {
                if (renderRow) {
                  return renderRow(row, rowIdx);
                }
                const rowKey = getKey(row, rowIdx);
                return (
                  <TableRow key={rowKey} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                    {columns.map((col, colIdx) => {
                      const colKey = col.id ?? col.field ?? col.accessor;
                      const rawVal = typeof col.accessor === 'function'
                        ? col.accessor(row)
                        : (colKey !== undefined && row ? row[colKey] : undefined);

                      let cellContent = rawVal;
                      if (typeof col.renderCell === 'function') {
                        cellContent = col.renderCell(row, rawVal);
                      } else if (typeof col.render === 'function') {
                        cellContent = col.render(row, rawVal);
                      } else if (rawVal !== undefined && rawVal !== null) {
                        cellContent = String(rawVal);
                      } else {
                        cellContent = '-';
                      }

                      return (
                        <TableCell key={colIdx} align={col.align || 'left'}>
                          {cellContent}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {onPageChange && (
        <TablePagination
          rowsPerPageOptions={rowsPerPageOptions}
          component="div"
          count={count}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
          sx={{
            borderTop: '1px solid',
            borderColor: 'divider',
            color: 'text.secondary',
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              fontSize: '12px'
            }
          }}
        />
      )}
    </Paper>
  );
}
