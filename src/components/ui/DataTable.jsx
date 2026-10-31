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
  rows = [],
  loading = false,
  emptyTitle = 'No data available',
  emptyDescription = 'There are no records matching your current filters.',
  page = 0,
  rowsPerPage = 10,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [10, 25, 50],
  keyExtractor = (row, idx) => row.id || idx,
  renderRow,
  maxHeight = 'calc(100vh - 280px)',
  sx = {}
}) {
  const count = totalCount !== undefined ? totalCount : rows.length;

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'slate.200',
        borderRadius: '12px',
        bgcolor: '#FFFFFF',
        ...sx
      }}
    >
      <TableContainer sx={{ maxHeight, overflowX: 'auto' }}>
        <Table stickyHeader size="small" aria-label="admin data table">
          <TableHead>
            <TableRow>
              {columns.map((col, idx) => (
                <TableCell
                  key={col.id || idx}
                  align={col.align || 'left'}
                  sx={{
                    width: col.width,
                    minWidth: col.minWidth || 100,
                    fontWeight: 700,
                    fontSize: '11px',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: 'slate.600',
                    bgcolor: 'slate.50',
                    borderBottom: '1px solid',
                    borderColor: 'slate.200'
                  }}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, rowIdx) => (
                <TableRow key={rowIdx}>
                  {columns.map((col, colIdx) => (
                    <TableCell key={colIdx} align={col.align || 'left'}>
                      <SkeletonBlock height={20} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} sx={{ py: 6, textAlign: 'center' }}>
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, rowIdx) => {
                if (renderRow) {
                  return renderRow(row, rowIdx);
                }
                return (
                  <TableRow key={keyExtractor(row, rowIdx)} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                    {columns.map((col, colIdx) => {
                      const val = col.accessor ? (typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor]) : row[col.id];
                      return (
                        <TableCell key={colIdx} align={col.align || 'left'}>
                          {col.render ? col.render(row, val) : val}
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
            borderColor: 'slate.200',
            color: 'slate.600',
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              fontSize: '12px'
            }
          }}
        />
      )}
    </Paper>
  );
}
