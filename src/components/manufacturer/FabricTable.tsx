
import React from 'react';
import { ManufacturerFabric } from '../../types';
import { Edit2, Trash2, Eye, EyeOff } from 'lucide-react';

interface FabricTableProps {
  fabrics: ManufacturerFabric[];
  onEdit: (fabric: ManufacturerFabric) => void;
  onDelete: (id: string | number) => void;
  onToggleStatus: (id: string | number) => void;
}

export const FabricTable: React.FC<FabricTableProps> = ({ fabrics, onEdit, onDelete, onToggleStatus }) => {
  if (fabrics.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-12 text-center">
        <p className="text-neutral-400 mb-2">No fabrics uploaded yet.</p>
        <p className="text-sm text-neutral-500">Use the form to add your first fabric.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200">
            <tr>
              <th className="px-6 py-4 w-20">Status</th>
              <th className="px-6 py-4">Code</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Fabrication</th>
              <th className="px-6 py-4">GSM</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {fabrics.map((fabric) => (
              <tr key={fabric.id} className="hover:bg-neutral-50/50 transition-colors">
                <td className="px-6 py-4">
                  <button
                    onClick={() => onToggleStatus(fabric.id)}
                    className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${fabric.isActive ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-neutral-100 text-neutral-400 hover:bg-neutral-200'}`}
                    title={fabric.isActive ? "Active" : "Inactive"}
                  >
                    {fabric.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                </td>
                <td className="px-6 py-4 font-mono text-neutral-500">{fabric.fabricCode}</td>
                <td className="px-6 py-4 font-medium text-neutral-900">{fabric.fabricName}</td>
                <td className="px-6 py-4 text-neutral-600">{fabric.fabrication}</td>
                <td className="px-6 py-4 text-neutral-600">{fabric.gsm}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onEdit(fabric)}
                      className="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(fabric.id)}
                      className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-neutral-100">
        {fabrics.map((fabric) => (
          <div key={fabric.id} className="p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-neutral-900">{fabric.fabricName}</h3>
                <p className="text-xs font-mono text-neutral-500 mt-1">{fabric.fabricCode}</p>
              </div>
              <button
                onClick={() => onToggleStatus(fabric.id)}
                className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${fabric.isActive ? 'bg-green-100 text-green-600' : 'bg-neutral-100 text-neutral-400'}`}
              >
                {fabric.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-neutral-500 text-xs block">Fabrication</span>
                <span className="text-neutral-700">{fabric.fabrication}</span>
              </div>
              <div>
                <span className="text-neutral-500 text-xs block">GSM</span>
                <span className="text-neutral-700">{fabric.gsm}</span>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-neutral-50 mt-2">
              <button
                onClick={() => onEdit(fabric)}
                className="flex items-center px-3 py-1.5 text-sm font-medium text-neutral-600 bg-neutral-50 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-colors"
              >
                <Edit2 size={14} className="mr-1.5" /> Edit
              </button>
              <button
                onClick={() => onDelete(fabric.id)}
                className="flex items-center px-3 py-1.5 text-sm font-medium text-neutral-600 bg-neutral-50 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <Trash2 size={14} className="mr-1.5" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
