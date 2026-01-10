/**
 * Production Queue Dashboard
 * Drag-drop Kanban board for managing order production
 */

'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

const STATUS_COLUMNS = [
  { id: 'pending', title: 'Pending', color: 'bg-gray-100' },
  { id: 'assigned', title: 'Assigned', color: 'bg-blue-100' },
  { id: 'cutting', title: 'Cutting', color: 'bg-yellow-100' },
  { id: 'stitching', title: 'Stitching', color: 'bg-orange-100' },
  { id: 'embroidery', title: 'Embroidery', color: 'bg-purple-100' },
  { id: 'finishing', title: 'Finishing', color: 'bg-pink-100' },
  { id: 'quality-check', title: 'Quality Check', color: 'bg-indigo-100' },
  { id: 'ready-for-shipment', title: 'Ready', color: 'bg-green-100' },
];

export default function ProductionQueuePage() {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchQueue = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/v1/production-queue', {
        params: {
          page: 1,
          limit: 100,
        },
      });
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch production queue:', error);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await axios.put(`/api/v1/production-queue/${id}`, { status });
      fetchQueue();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const itemId = result.draggableId;
    const newStatus = result.destination.droppableId;

    updateStatus(itemId, newStatus);
  };

  const handleBulkAction = async (action: 'status' | 'cutting-sheets' | 'whatsapp') => {
    if (selectedItems.length === 0) return;

    // TODO: Implement bulk actions
    console.log(`Bulk ${action} for:`, selectedItems);
  };

  if (isLoading) {
    return <div className="p-8">Loading production queue...</div>;
  }

  const itemsByStatus = STATUS_COLUMNS.reduce((acc, column) => {
    acc[column.id] = data?.items?.filter((item: any) => item.status === column.id) || [];
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Production Queue</h1>
          <p className="text-gray-600 mt-1">Manage order production workflow</p>
        </div>
        
        {selectedItems.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkAction('status')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Update Status ({selectedItems.length})
            </button>
            <button
              onClick={() => handleBulkAction('cutting-sheets')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Print Sheets ({selectedItems.length})
            </button>
            <button
              onClick={() => handleBulkAction('whatsapp')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              WhatsApp ({selectedItems.length})
            </button>
          </div>
        )}
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-4 gap-4 overflow-x-auto">
          {STATUS_COLUMNS.map((column) => (
            <div key={column.id} className="flex-shrink-0 w-64">
              <div className={`${column.color} rounded-lg p-4 mb-2`}>
                <h3 className="font-semibold">{column.title}</h3>
                <span className="text-sm text-gray-600">
                  {itemsByStatus[column.id]?.length || 0} orders
                </span>
              </div>
              
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[200px] space-y-2 ${
                      snapshot.isDraggingOver ? 'bg-blue-50' : ''
                    }`}
                  >
                    {itemsByStatus[column.id]?.map((item: any, index: number) => (
                      <Draggable
                        key={item._id}
                        draggableId={item._id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white p-3 rounded-lg shadow-sm border ${
                              snapshot.isDragging ? 'shadow-lg' : ''
                            } ${selectedItems.includes(item._id) ? 'ring-2 ring-blue-500' : ''}`}
                            onClick={() => {
                              setSelectedItems((prev) =>
                                prev.includes(item._id)
                                  ? prev.filter((id) => id !== item._id)
                                  : [...prev, item._id]
                              );
                            }}
                          >
                            <div className="font-semibold text-sm">
                              {item.orderNumber || item.orderId?.orderNumber}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              {item.priority && (
                                <span className={`px-2 py-0.5 rounded ${
                                  item.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                  item.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {item.priority}
                                </span>
                              )}
                            </div>
                            {item.assignedTailor?.tailorId && (
                              <div className="text-xs text-gray-500 mt-1">
                                Tailor: {item.assignedTailor.tailorId.name}
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
