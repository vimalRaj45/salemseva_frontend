import React, { useState, useMemo } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  TableSortLabel,
  Typography
} from '@mui/material';
import { Search, X, ArrowUpDown } from 'lucide-react';
import LoadingSkeleton from './LoadingSkeleton';
import EmptyState from './EmptyState';

export default function DataTable({
  columns = [],
  data = [],
  keyField = 'id',
  isLoading = false,
  searchPlaceholder = 'Search records...',
  searchFields = [],
  emptyTitle = 'No records found',
  emptyDescription = 'There are no items to display right now.',
  initialPageSize = 10,
  pageSizeOptions = [5, 10, 25, 50],
  onRowClick,
  toolbarExtra,
  sx = {}
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(initialPageSize);
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  // Filtered dataset based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase().trim();

    return data.filter((row) => {
      // If searchFields are specified, search only those fields
      if (searchFields && searchFields.length > 0) {
        return searchFields.some((field) => {
          const val = row[field];
          return val !== null && val !== undefined && String(val).toLowerCase().includes(term);
        });
      }

      // Otherwise search all column accessor fields
      return columns.some((col) => {
        if (!col.field) return false;
        const val = row[col.field];
        return val !== null && val !== undefined && String(val).toLowerCase().includes(term);
      });
    });
  }, [data, searchTerm, searchFields, columns]);

  // Sorted dataset
  const sortedData = useMemo(() => {
    if (!sortField) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const strA = String(aVal).toLowerCase();
      const strB = String(bVal).toLowerCase();
      return sortDirection === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
  }, [filteredData, sortField, sortDirection]);

  // Paginated slice
  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage;
    return sortedData.slice(start, start + rowsPerPage);
  }, [sortedData, page, rowsPerPage]);

  const handleSort = (field) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortField(null);
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        ...sx
      }}
    >
      {/* Table Toolbar */}
      <Box
        sx={{
          p: { xs: 1.5, sm: 2 },
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          gap: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <TextField
          size="small"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0);
          }}
          placeholder={searchPlaceholder}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={16} color="#64748B" />
              </InputAdornment>
            ),
            endAdornment: searchTerm ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchTerm('')} aria-label="Clear search">
                  <X size={14} />
                </IconButton>
              </InputAdornment>
            ) : null,
            sx: {
              height: 38,
              fontSize: '0.875rem',
              minWidth: { sm: 280 }
            }
          }}
        />

        {toolbarExtra && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            {toolbarExtra}
          </Box>
        )}
      </Box>

      {/* Main Table Content */}
      {isLoading ? (
        <Box sx={{ p: 2 }}>
          <LoadingSkeleton type="table" count={5} columns={columns.length} />
        </Box>
      ) : sortedData.length === 0 ? (
        <Box sx={{ p: 2 }}>
          <EmptyState
            title={emptyTitle}
            description={
              searchTerm
                ? `No results found for "${searchTerm}". Try adjusting your keywords.`
                : emptyDescription
            }
            actionLabel={searchTerm ? 'Clear Search' : undefined}
            onAction={searchTerm ? () => setSearchTerm('') : undefined}
          />
        </Box>
      ) : (
        <>
          <TableContainer sx={{ maxHeight: 640 }}>
            <Table stickyHeader size="small" aria-label="Data table">
              <TableHead>
                <TableRow>
                  {columns.map((col) => {
                    const isSortable = col.sortable !== false;
                    return (
                      <TableCell
                        key={col.field || col.id || col.headerName}
                        align={col.align || 'left'}
                        sx={{
                          width: col.width,
                          minWidth: col.minWidth || 100,
                          fontWeight: 700,
                          bgcolor: 'background.default'
                        }}
                      >
                        {isSortable ? (
                          <TableSortLabel
                            active={sortField === col.field}
                            direction={sortField === col.field ? sortDirection : 'asc'}
                            onClick={() => handleSort(col.field)}
                          >
                            {col.headerName}
                          </TableSortLabel>
                        ) : (
                          col.headerName
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.map((row, rowIdx) => {
                  const rowKey = row[keyField] || rowIdx;
                  return (
                    <TableRow
                      key={rowKey}
                      hover
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                      sx={{
                        cursor: onRowClick ? 'pointer' : 'default',
                        '&:last-child td': { borderBottom: 'none' }
                      }}
                    >
                      {columns.map((col) => {
                        const cellValue = col.renderCell
                          ? col.renderCell(row)
                          : col.field
                          ? row[col.field]
                          : null;

                        return (
                          <TableCell
                            key={col.field || col.id || col.headerName}
                            align={col.align || 'left'}
                            sx={{ py: 1.5 }}
                          >
                            {cellValue !== undefined && cellValue !== null ? cellValue : '—'}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={pageSizeOptions}
            component="div"
            count={sortedData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              borderTop: '1px solid',
              borderColor: 'divider',
              '.MuiTablePagination-toolbar': {
                minHeight: 48,
                px: { xs: 1, sm: 2 }
              }
            }}
          />
        </>
      )}
    </Paper>
  );
}
