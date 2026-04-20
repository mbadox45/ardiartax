// src/components/layout/universal-data-table.tsx
"use client"

import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel, // Tambahkan ini
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"

interface UniversalDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  // Tambahkan props ini agar parent bisa memantau item yang dipilih
  onSelectionChange?: (selectedRows: TData[]) => void 
}

export function UniversalDataTable<TData, TValue>({
  columns,
  data,
  onSelectionChange
}: UniversalDataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [rowSelection, setRowSelection] = React.useState({}) // State untuk checkbox

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection, // Sinkronisasi state
    state: {
      sorting,
      rowSelection, // Masukkan ke state table
    },
  })

  // Efek untuk mengirim data terpilih kembali ke parent component
  React.useEffect(() => {
    if (onSelectionChange) {
      const selectedData = table.getFilteredSelectedRowModel().rows.map((row) => row.original)
      onSelectionChange(selectedData)
    }
  }, [rowSelection, table, onSelectionChange])

  return (
    <div className="space-y-4">
      

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="font-bold">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="font-bold text-xs">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow 
                  key={row.id} 
                  className="text-xs"
                  data-state={row.getIsSelected() && "selected"} // Style row saat terpilih
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between py-2">
        {/* Keterangan jumlah terpilih */}
        <div className="text-xs text-muted-foreground px-2">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        {/* Pagination Controls tetap sama */}
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}