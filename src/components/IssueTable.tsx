import React, { useState, useEffect, useMemo } from 'react';
import { useTable, useFilters, useSortBy, Column } from 'react-table';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { fetchIssues, GitlabIssue } from '../services/gitlabApi';
import { Search, ExternalLink, AlertTriangle, CheckCircle, Filter, X } from 'lucide-react';

interface IssueTableProps {
  dateRange?: { startDate: Date; endDate: Date };
}

// Default filter UI for text columns
function DefaultColumnFilter({
  column: { filterValue, preFilteredRows, setFilter },
}: {
  column: {
    filterValue: any;
    preFilteredRows: any[];
    setFilter: (updater: any) => void;
  };
}) {
  const count = preFilteredRows.length;

  return (
    <div className="flex items-center mt-1">
      <input
        value={filterValue || ''}
        onChange={e => {
          setFilter(e.target.value || undefined);
        }}
        placeholder={`Filtrar ${count} registros...`}
        className="w-full text-xs p-1 border border-gray-300 rounded"
      />
      {filterValue && (
        <button
          className="ml-1 text-gray-400 hover:text-gray-600"
          onClick={() => setFilter(undefined)}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

// Select filter UI for status and severity
function SelectColumnFilter({
  column: { filterValue, setFilter, preFilteredRows, id },
}: {
  column: {
    filterValue: any;
    setFilter: (updater: any) => void;
    preFilteredRows: any[];
    id: string;
  };
}) {
  const options = useMemo(() => {
    const options = new Set<string>();
    preFilteredRows.forEach(row => {
      if (row.values[id] !== undefined && row.values[id] !== null) {
        options.add(row.values[id]);
      }
    });
    return [...options.values()];
  }, [id, preFilteredRows]);

  return (
    <div className="flex items-center mt-1">
      <select
        value={filterValue || ''}
        onChange={e => {
          setFilter(e.target.value || undefined);
        }}
        className="w-full text-xs p-1 border border-gray-300 rounded"
      >
        <option value="">Todos</option>
        {options.map((option, i) => (
          <option key={i} value={option}>
            {option}
          </option>
        ))}
      </select>
      {filterValue && (
        <button
          className="ml-1 text-gray-400 hover:text-gray-600"
          onClick={() => setFilter(undefined)}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

// Date range filter UI
function DateRangeColumnFilter({
  column: { filterValue = [], preFilteredRows, setFilter, id },
}: {
  column: {
    filterValue: any;
    setFilter: (updater: any) => void;
    preFilteredRows: any[];
    id: string;
  };
}) {
  const [min, max] = useMemo(() => {
    let min = preFilteredRows.length ? new Date(preFilteredRows[0].values[id]) : new Date();
    let max = preFilteredRows.length ? new Date(preFilteredRows[0].values[id]) : new Date();

    preFilteredRows.forEach(row => {
      if (row.values[id]) {
        const date = new Date(row.values[id]);
        if (date < min) min = date;
        if (date > max) max = date;
      }
    });

    return [min, max];
  }, [id, preFilteredRows]);

  return (
    <div className="flex flex-col space-y-1 mt-1">
      <div className="flex items-center">
        <input
          type="date"
          value={filterValue[0] || ''}
          onChange={e => {
            const val = e.target.value;
            setFilter((old = []) => [val ? val : undefined, old[1]]);
          }}
          className="w-full text-xs p-1 border border-gray-300 rounded"
        />
        {filterValue[0] && (
          <button
            className="ml-1 text-gray-400 hover:text-gray-600"
            onClick={() => setFilter((old = []) => [undefined, old[1]])}
          >
            <X size={14} />
          </button>
        )}
      </div>
      <div className="flex items-center">
        <input
          type="date"
          value={filterValue[1] || ''}
          onChange={e => {
            const val = e.target.value;
            setFilter((old = []) => [old[0], val ? val : undefined]);
          }}
          className="w-full text-xs p-1 border border-gray-300 rounded"
        />
        {filterValue[1] && (
          <button
            className="ml-1 text-gray-400 hover:text-gray-600"
            onClick={() => setFilter((old = []) => [old[0], undefined])}
          >
            <X size={14} />
          </button>
        )}
      </div>
      {(filterValue[0] || filterValue[1]) && (
        <button
          className="text-xs text-indigo-600 hover:text-indigo-800"
          onClick={() => setFilter(undefined)}
        >
          Limpar filtro
        </button>
      )}
    </div>
  );
}

const IssueTable: React.FC<IssueTableProps> = ({ dateRange }) => {
  const [issues, setIssues] = useState<GitlabIssue[]>([]);
  const [filterInput, setFilterInput] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getIssues = async () => {
      setLoading(true);
      try {
        const data = await fetchIssues(
          dateRange?.startDate,
          dateRange?.endDate
        );
        setIssues(data);
      } catch (error) {
        console.error('Error fetching issues:', error);
      } finally {
        setLoading(false);
      }
    };

    getIssues();
  }, [dateRange]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return format(parseISO(dateString), 'dd/MM/yyyy', { locale: ptBR });
  };

  const formatMonth = (dateString: string | null) => {
    if (!dateString) return '-';
    return format(parseISO(dateString), 'MMMM', { locale: ptBR });
  };

  const getSeverityBadge = (severity: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    
    switch (severity.toLowerCase()) {
      case 'critical':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>Crítico</span>;
      case 'high':
        return <span className={`${baseClasses} bg-orange-100 text-orange-800`}>Alto</span>;
      case 'medium':
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Médio</span>;
      case 'low':
        return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>Baixo</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{severity}</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium flex items-center";
    
    if (status === 'opened') {
      return (
        <span className={`${baseClasses} bg-green-100 text-green-800`}>
          <AlertTriangle className="w-3 h-3 mr-1" />
          Aberto
        </span>
      );
    } else {
      return (
        <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
          <CheckCircle className="w-3 h-3 mr-1" />
          Fechado
        </span>
      );
    }
  };

  const columns = useMemo<Column<GitlabIssue>[]>(
    () => [
      { 
        Header: 'Projeto', 
        accessor: (row) => row.project.name,
        id: 'project.name',
        Filter: DefaultColumnFilter,
        filter: 'includes',
      },
      { 
        Header: 'ID', 
        accessor: 'iid',
        Cell: ({ value }) => <span className="font-mono">#{value}</span>,
        Filter: DefaultColumnFilter,
        filter: 'includes',
      },
      { 
        Header: 'Título', 
        accessor: 'title',
        Cell: ({ value, row }) => (
          <div className="max-w-md truncate" title={value}>
            {value}
          </div>
        ),
        Filter: DefaultColumnFilter,
        filter: 'includes',
      },
      { 
        Header: 'Link', 
        accessor: 'web_url',
        Cell: ({ value }) => (
          <a 
            href={value} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-900 flex items-center"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        ),
        disableSortBy: true,
        disableFilters: true,
      },
      { 
        Header: 'Status', 
        accessor: 'state',
        Cell: ({ value }) => getStatusBadge(value),
        Filter: SelectColumnFilter,
        filter: 'equals',
      },
      { 
        Header: 'Severidade', 
        accessor: 'severity',
        Cell: ({ value }) => getSeverityBadge(value),
        Filter: SelectColumnFilter,
        filter: 'equals',
      },
      { 
        Header: 'Data de Abertura', 
        accessor: 'created_at',
        Cell: ({ value }) => formatDate(value),
        Filter: DateRangeColumnFilter,
        filter: 'between',
      },
      { 
        Header: 'Mês de Abertura', 
        accessor: (row) => formatMonth(row.created_at),
        id: 'month_created',
        Filter: SelectColumnFilter,
        filter: 'equals',
      },
      { 
        Header: 'Data de Fechamento', 
        accessor: 'closed_at',
        Cell: ({ value }) => formatDate(value),
        Filter: DateRangeColumnFilter,
        filter: 'between',
      },
      { 
        Header: 'Mês de Fechamento', 
        accessor: (row) => formatMonth(row.closed_at),
        id: 'month_closed',
        Filter: SelectColumnFilter,
        filter: 'equals',
      },
      { 
        Header: 'Autor', 
        accessor: (row) => row.author.name,
        id: 'author.name',
        Filter: DefaultColumnFilter,
        filter: 'includes',
      },
    ],
    []
  );

  const defaultColumn = useMemo(
    () => ({
      // Default Filter UI
      Filter: DefaultColumnFilter,
    }),
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    setFilter,
    state,
  } = useTable(
    {
      columns,
      data: issues,
      defaultColumn,
      filterTypes: {
        between: (rows, id, filterValue) => {
          const [min, max] = filterValue || [];
          if (min && max) {
            return rows.filter(row => {
              const rowValue = row.values[id];
              if (!rowValue) return false;
              
              const date = new Date(rowValue);
              const minDate = new Date(min);
              const maxDate = new Date(max);
              
              return date >= minDate && date <= maxDate;
            });
          } else if (min) {
            return rows.filter(row => {
              const rowValue = row.values[id];
              if (!rowValue) return false;
              
              const date = new Date(rowValue);
              const minDate = new Date(min);
              
              return date >= minDate;
            });
          } else if (max) {
            return rows.filter(row => {
              const rowValue = row.values[id];
              if (!rowValue) return false;
              
              const date = new Date(rowValue);
              const maxDate = new Date(max);
              
              return date <= maxDate;
            });
          }
          return rows;
        },
        includes: (rows, id, filterValue) => {
          return rows.filter(row => {
            const rowValue = row.values[id];
            return rowValue !== undefined
              ? String(rowValue)
                  .toLowerCase()
                  .includes(String(filterValue).toLowerCase())
              : true;
          });
        },
      },
    },
    useFilters,
    useSortBy
  );

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value || undefined;
    setFilter('title', value);
    setFilterInput(value);
  };

  if (loading) {
    return <div className="text-center py-10">Carregando issues...</div>;
  }

  return (
    <div className="overflow-x-auto">
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        <input
          value={filterInput}
          onChange={handleFilterChange}
          placeholder="Filtrar por título"
          className="block w-full p-2 pl-10 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      
      <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200" {...getTableProps()}>
          <thead className="bg-gray-50">
            {headerGroups.map(headerGroup => {
              const { key, ...restHeaderGroupProps } = headerGroup.getHeaderGroupProps();
              return (
                <tr key={key} {...restHeaderGroupProps}>
                  {headerGroup.headers.map(column => {
                    const { key, ...restColumnProps } = column.getHeaderProps(column.getSortByToggleProps());
                    return (
                      <th
                        key={key}
                        {...restColumnProps}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {column.render('Header')}
                            <span>
                              {column.isSorted ? (
                                column.isSortedDesc ? (
                                  <span className="ml-1">▼</span>
                                ) : (
                                  <span className="ml-1">▲</span>
                                )
                              ) : (
                                ''
                              )}
                            </span>
                          </div>
                          {!column.disableFilters && (
                            <div className="ml-2">
                              <Filter size={14} className="text-gray-400" />
                            </div>
                          )}
                        </div>
                        {!column.disableFilters && (
                          <div>{column.canFilter ? column.render('Filter') : null}</div>
                        )}
                      </th>
                    );
                  })}
                </tr>
              );
            })}
          </thead>
          <tbody
            className="bg-white divide-y divide-gray-200"
            {...getTableBodyProps()}
          >
            {rows.length > 0 ? (
              rows.map(row => {
                prepareRow(row);
                const { key, ...restRowProps } = row.getRowProps();
                return (
                  <tr key={key} {...restRowProps} className="hover:bg-gray-50">
                    {row.cells.map(cell => {
                      const { key, ...restCellProps } = cell.getCellProps();
                      return (
                        <td
                          key={key}
                          {...restCellProps}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                        >
                          {cell.render('Cell')}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  Nenhuma issue encontrada
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-sm text-gray-500">
        Total de issues: {rows.length}
      </div>
    </div>
  );
};

export default IssueTable;