// src/components/layout/universal-data-table.tsx
"use client"

import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type OnChangeFn,
  type RowSelectionState,
} from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"

interface UniversalDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  // Tambahkan kedua props ini untuk sinkronisasi checkbox
  rowSelection?: RowSelectionState
  onRowSelectionChange?: OnChangeFn<RowSelectionState>
  // Callback lama tetap dipertahankan jika Anda membutuhkannya
  onSelectionChange?: (selectedRows: TData[]) => void 
}

export function UniversalDataTable<TData, TValue>({
  columns,
  data,
  rowSelection = {}, // Default ke object kosong jika tidak dikirim
  onRowSelectionChange,
  onSelectionChange
}: UniversalDataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    // Gunakan fungsi pengubah state dari props (ListPebTab)
    onRowSelectionChange: onRowSelectionChange, 
    state: {
      sorting,
      rowSelection, // Gunakan state dari props (ListPebTab)
    },
  })

  // Efek ini akan berjalan setiap kali rowSelection di Parent berubah
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
              <TableRow key={headerGroup.id} className="bg-muted/50">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="font-bold text-xs uppercase text-foreground">
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
                  className="text-xs transition-colors hover:bg-muted/30"
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="whitespace-nowrap py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  Data tidak ditemukan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between py-2">
        <div className="text-[11px] text-muted-foreground px-2 italic">
          {table.getFilteredSelectedRowModel().rows.length} dari{" "}
          {table.getFilteredRowModel().rows.length} baris dipilih.
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
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