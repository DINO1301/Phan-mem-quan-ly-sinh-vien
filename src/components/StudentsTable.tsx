import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createColumnHelper, flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from "@tanstack/react-table";
import { Eye, Edit2, Trash2 } from "lucide-react";
import type { StudentSummary } from "@/types";
import { formatDate, formatStatus, getStatusClasses } from "@/utils/format";

interface StudentsTableProps {
  students: StudentSummary[];
  onEdit: (student: StudentSummary) => void;
  onDelete: (studentId: string) => void;
  hideClassColumn?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

const columnHelper = createColumnHelper<StudentSummary>();

export default function StudentsTable({
  students,
  onEdit,
  onDelete,
  hideClassColumn = false,
  canEdit = true,
  canDelete = true,
}: StudentsTableProps) {
  const navigate = useNavigate();
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 6 });
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [students]);
  const columns = useMemo(
    () => [
      columnHelper.accessor("studentCode", {
        header: "Mã SV",
        cell: (info) => <span className="font-medium text-slate-900">{info.getValue()}</span>,
      }),
      columnHelper.accessor("fullName", {
        header: "Họ và tên",
        cell: (info) => (
          <div>
            <p className="font-medium text-slate-900">{info.getValue()}</p>
            <p className="text-xs text-slate-500">{info.row.original.email ?? "Chưa có email"}</p>
          </div>
        ),
      }),
      ...(hideClassColumn ? [] : [
        columnHelper.accessor("className", {
          header: "Lớp",
          cell: (info) => <span className="text-slate-700">{info.getValue()}</span>,
        }),
      ]),
      columnHelper.accessor("majorName", {
        header: "Ngành",
        cell: (info) => <span className="text-slate-700">{info.getValue()}</span>,
      }),
      columnHelper.accessor("updatedAt", {
        header: "Cập nhật",
        cell: (info) => <span className="text-slate-600">{formatDate(info.getValue())}</span>,
      }),
      columnHelper.accessor("status", {
        header: "Trạng thái",
        cell: (info) => (
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(info.getValue())}`}>
            {formatStatus(info.getValue())}
          </span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: (info) => (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => navigate(`/students/${info.row.original.id}`)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
            >
              <Eye className="h-3.5 w-3.5" />
              Chi tiết
            </button>
            {canEdit && (
              <button
                type="button"
                onClick={() => onEdit(info.row.original)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
              >
                <Edit2 className="h-3.5 w-3.5" />
                Sửa
              </button>
            )}
            {canDelete && (
              <button
                type="button"
                onClick={() => onDelete(info.row.original.id)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Xoá
              </button>
            )}
          </div>
        ),
      }),
    ],
    [navigate, onEdit, onDelete, hideClassColumn, canEdit, canDelete],
  );

  const table = useReactTable({
    data: students,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { pagination },
    onPaginationChange: setPagination,
  });

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-6 py-4 font-medium">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="transition hover:bg-slate-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {students.length > pagination.pageSize ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-6 py-4 text-sm text-slate-700">
          <span>
            Trang {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Trang trước
            </button>
            <button
              type="button"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Trang sau
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
