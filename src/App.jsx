import React, { useState } from 'react';
import { DndContext, DragOverlay, useDraggable, useDroppable } from '@dnd-kit/core';

// ==========================================
// THE TOYBOX (Initial Data)
// ==========================================
const initialWorkers = [
  { id: 'w-1', name: 'Alice', maxLives: 4, type: 'Full-Time' },
  { id: 'w-2', name: 'Bob', maxLives: 3, type: 'Part-Time' },
  { id: 'w-3', name: 'Charlie', maxLives: 4, type: 'Full-Time' }
];

const initialSchedule = {
  monday: { am: [], pm: [] },
  tuesday: { am: [], pm: [] },
  wednesday: { am: [], pm: [] },
  thursday: { am: [], pm: [] },
  friday: { am: [], pm: [] },
  saturday: { am: [], pm: [] },
  sunday: { am: [], pm: [] }
};

// ==========================================
// SUB-COMPONENTS
// ==========================================

function DraggableWorker({ worker, usedLives }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: worker.id,
    data: { worker }
  });

  const isOvertime = usedLives >= worker.maxLives;

  return (
    <div 
      ref={setNodeRef} {...listeners} {...attributes} 
      style={{ 
        padding: '12px', margin: '10px 0', 
        backgroundColor: isOvertime ? '#ffe6e6' : '#f9f9f9', 
        border: isOvertime ? '1px solid #ff4d4d' : '1px solid #ddd', 
        borderRadius: '6px', cursor: 'grab', opacity: isDragging ? 0.4 : 1, 
      }}
    >
      <div style={{ fontWeight: 'bold', color: isOvertime ? '#d32f2f' : 'black' }}>
        {worker.name} {isOvertime && '(Overtime)'}
      </div>
      <div style={{ fontSize: '0.8em', color: 'gray', marginBottom: '8px' }}>{worker.type}</div>
      
      {/* The Lives Dots */}
      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
        {[...Array(worker.maxLives)].map((_, index) => (
          <div key={index} style={{ 
            width: '12px', height: '12px', borderRadius: '50%', 
            backgroundColor: isOvertime ? '#ff4d4d' : (index < usedLives ? '#e0e0e0' : '#4caf50') 
          }} />
        ))}
        {/* Extra Overtime Dots */}
        {usedLives > worker.maxLives && [...Array(usedLives - worker.maxLives)].map((_, index) => (
          <div key={`extra-${index}`} style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#8b0000' }} />
        ))}
      </div>
    </div>
  );
}

function ShiftDropZone({ id, title, defaultTime, children }) {
  const { isOver, setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} style={{ 
      minHeight: '80px', padding: '10px', borderRadius: '6px',
      border: '2px dashed #ccc', backgroundColor: isOver ? '#e8f5e9' : '#fff'
    }}>
      <h4 style={{ margin: '0 0 5px 0', color: '#555' }}>{title}</h4>
      <div style={{ fontSize: '0.8em', color: '#999', marginBottom: '10px' }}>{defaultTime}</div>
      {children}
    </div>
  );
}

function ShiftConfirmationModal({ pendingShift, onConfirm, onCancel }) {
  const [isEditing, setIsEditing] = useState(false);
  const isMorning = pendingShift.zoneId.includes('am');
  const [startTime, setStartTime] = useState(isMorning ? '7:45 AM' : '2:00 PM');
  const [endTime, setEndTime] = useState(isMorning ? '5:45 PM' : 'Close');

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '300px' }}>
        <h3 style={{ marginTop: 0 }}>Assign {pendingShift.worker.name}?</h3>
        <p style={{ color: 'gray', fontSize: '0.9em' }}>Zone: <strong>{pendingShift.zoneId.toUpperCase()}</strong></p>

        {isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
            <label>Start <input value={startTime} onChange={e => setStartTime(e.target.value)} style={{ width: '100%', padding: '4px' }} /></label>
            <label>End <input value={endTime} onChange={e => setEndTime(e.target.value)} style={{ width: '100%', padding: '4px' }} /></label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => onConfirm(startTime, endTime)} style={{ flex: 1, padding: '8px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
              <button onClick={onCancel} style={{ flex: 1, padding: '8px', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        ) : (
          <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <p><strong>Hours:</strong> {startTime} - {endTime}</p>
            <button onClick={() => onConfirm(startTime, endTime)} style={{ padding: '10px', backgroundColor: '#2196f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Confirm Default</button>
            <button onClick={() => setIsEditing(true)} style={{ padding: '8px', border: '1px solid #2196f3', color: '#2196f3', backgroundColor: 'transparent', borderRadius: '4px', cursor: 'pointer' }}>Edit Hours</button>
            <button onClick={onCancel} style={{ padding: '8px', border: 'none', color: 'gray', backgroundColor: 'transparent', cursor: 'pointer' }}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// THE MAIN APP
// ==========================================
export default function App() {
  const [schedule, setSchedule] = useState(initialSchedule);
  const [activeDragWorker, setActiveDragWorker] = useState(null);
  const [pendingShift, setPendingShift] = useState(null);

  // FLAG: Set to true for manager controls (the "X" buttons), false for read-only.
  const isManagerView = true; 

  const getUsedLives = (workerId) => {
    let count = 0;
    Object.values(schedule).forEach(day => {
      count += day.am.filter(shift => shift.workerId === workerId).length;
      count += day.pm.filter(shift => shift.workerId === workerId).length;
    });
    return count;
  };

  const handleDragStart = (event) => {
    setActiveDragWorker(event.active.data.current.worker);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveDragWorker(null);
    if (!over) return;

    setPendingShift({
      worker: active.data.current.worker,
      zoneId: over.id
    });
  };

  const confirmShiftAssignment = (startTime, endTime) => {
    const [day, ampm] = pendingShift.zoneId.split('-'); 
    const newShift = {
      id: Math.random().toString(36).substr(2, 9),
      workerId: pendingShift.worker.id,
      workerName: pendingShift.worker.name,
      startTime,
      endTime
    };

    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [ampm]: [...prev[day][ampm], newShift]
      }
    }));
    setPendingShift(null); 
  };

  const removeShift = (day, ampm, shiftIdToRemove) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [ampm]: prev[day][ampm].filter(shift => shift.id !== shiftIdToRemove)
      }
    }));
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div style={{ fontFamily: 'sans-serif', padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Shift Scheduler</h1>
        
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '20px' }}>
          
          {/* THE BENCH */}
          {isManagerView && (
            <div style={{ width: '250px', border: '2px dashed #ccc', padding: '15px', borderRadius: '8px', backgroundColor: '#fdfdfd' }}>
              <h2 style={{ marginTop: 0 }}>The Bench</h2>
              {initialWorkers.map(worker => (
                <DraggableWorker key={worker.id} worker={worker} usedLives={getUsedLives(worker.id)} />
              ))}
            </div>
          )}

          {/* THE CALENDAR */}
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
            {Object.keys(schedule).map(day => (
              <div key={day} style={{ border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#fafafa' }}>
                <div style={{ backgroundColor: '#eee', padding: '10px', textAlign: 'center', fontWeight: 'bold', textTransform: 'capitalize' }}>
                  {day}
                </div>
                <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  
                  {/* AM Zone */}
                  <ShiftDropZone id={`${day}-am`} title="☀️ AM" defaultTime="7:45 - 5:45">
                    {schedule[day].am.map(shift => (
                      <div key={shift.id} style={{ position: 'relative', backgroundColor: '#e3f2fd', padding: '8px', borderRadius: '4px', fontSize: '0.85em', marginTop: '5px', border: '1px solid #bbdefb' }}>
                        <strong>{shift.workerName}</strong><br/>{shift.startTime} - {shift.endTime}
                        {isManagerView && (
                          <button onClick={() => removeShift(day, 'am', shift.id)} style={{ position: 'absolute', top: '2px', right: '4px', background: 'transparent', border: 'none', color: '#d32f2f', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2em' }}>×</button>
                        )}
                      </div>
                    ))}
                  </ShiftDropZone>

                  {/* PM Zone */}
                  <ShiftDropZone id={`${day}-pm`} title="🌙 PM" defaultTime="2:00 - Close">
                    {schedule[day].pm.map(shift => (
                      <div key={shift.id} style={{ position: 'relative', backgroundColor: '#fff3e0', padding: '8px', borderRadius: '4px', fontSize: '0.85em', marginTop: '5px', border: '1px solid #ffe0b2' }}>
                        <strong>{shift.workerName}</strong><br/>{shift.startTime} - {shift.endTime}
                        {isManagerView && (
                          <button onClick={() => removeShift(day, 'pm', shift.id)} style={{ position: 'absolute', top: '2px', right: '4px', background: 'transparent', border: 'none', color: '#d32f2f', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2em' }}>×</button>
                        )}
                      </div>
                    ))}
                  </ShiftDropZone>

                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* THE MODAL */}
      {pendingShift && (
        <ShiftConfirmationModal pendingShift={pendingShift} onConfirm={confirmShiftAssignment} onCancel={() => setPendingShift(null)} />
      )}

      {/* THE GHOST OVERLAY */}
      <DragOverlay>
        {activeDragWorker ? (
          <div style={{ padding: '12px', backgroundColor: 'white', border: '2px solid #2196f3', borderRadius: '6px', boxShadow: '0 5px 15px rgba(0,0,0,0.2)', opacity: 0.9 }}>
            <strong>{activeDragWorker.name}</strong>
          </div>
        ) : null}
      </DragOverlay>

    </DndContext>
  );
}
