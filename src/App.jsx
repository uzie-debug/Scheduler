import React, { useState, useEffect } from 'react';
import { 
  DndContext, DragOverlay, useDraggable, useDroppable, 
  useSensor, useSensors, MouseSensor, TouchSensor 
} from '@dnd-kit/core';

// ==========================================
// 1. THE TOYBOX (Initial Data)
// ==========================================
const initialWorkers = [
  { id: 'w-1', name: 'Gary', maxLives: 4, type: 'Full-Time' },
  { id: 'w-2', name: 'Jaime', maxLives: 3, type: 'Part-Time' },
  { id: 'w-3', name: 'Angelique', maxLives: 4, type: 'Full-Time' },
  { id: 'w-4', name: 'Kadie', maxLives: 4, type: 'Full-Time' },
  { id: 'w-5', name: 'Kaylee', maxLives: 4, type: 'Full-Time' },
  { id: 'w-6', name: 'Isaiah', maxLives: 4, type: 'Full-Time' },
  { id: 'w-7', name: 'Lucas', maxLives: 3, type: 'Part-Time' },
  { id: 'w-8', name: 'Erica', maxLives: 4, type: 'Full-Time' },
  { id: 'w-9', name: 'Ursa', maxLives: 4, type: 'Full-Time' },
  { id: 'w-10', name: 'Jasmin', maxLives: 4, type: 'Full-Time' },
  { id: 'w-11', name: 'Markus', maxLives: 4, type: 'Full-Time' },
  { id: 'w-12', name: 'Jesus', maxLives: 4, type: 'Full-Time' },
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

const TIME_OPTIONS = [
  "6:00 AM", "6:30 AM", "7:00 AM", "7:30 AM", "7:45 AM", "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", 
  "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", 
  "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM", "5:45 PM", 
  "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM", "9:00 PM", "9:30 PM", 
  "10:00 PM", "10:30 PM", "11:00 PM", "Close"
];

// ==========================================
// 2. SUB-COMPONENTS
// ==========================================

function DraggableWorker({ worker, usedLives, isDarkMode }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: worker.id,
    data: { worker }
  });

  const isOvertime = usedLives >= worker.maxLives;

  const bgNormal = isDarkMode ? '#2c2c2c' : '#f9f9f9';
  const bgOvertime = isDarkMode ? '#4a1c1c' : '#ffe6e6';
  const borderNormal = isDarkMode ? '#444' : '#ddd';
  const borderOvertime = isDarkMode ? '#ff6b6b' : '#ff4d4d';
  const textMain = isDarkMode ? '#e0e0e0' : 'black';
  const textOvertime = isDarkMode ? '#ff8a80' : '#d32f2f';
  const textSub = isDarkMode ? '#aaa' : 'gray';

  return (
    <div 
      ref={setNodeRef} {...listeners} {...attributes} 
      style={{ 
        padding: '12px', margin: '10px 0', 
        backgroundColor: isOvertime ? bgOvertime : bgNormal, 
        border: `1px solid ${isOvertime ? borderOvertime : borderNormal}`, 
        borderRadius: '6px', cursor: 'grab', opacity: isDragging ? 0.4 : 1, 
      }}
    >
      <div style={{ fontWeight: 'bold', color: isOvertime ? textOvertime : textMain }}>
        {worker.name} {isOvertime && '(Overtime)'}
      </div>
      <div style={{ fontSize: '0.8em', color: textSub, marginBottom: '8px' }}>{worker.type}</div>
      
      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
        {[...Array(worker.maxLives)].map((_, index) => (
          <div key={index} style={{ 
            width: '12px', height: '12px', borderRadius: '50%', 
            backgroundColor: isOvertime ? '#ff4d4d' : (index < usedLives ? (isDarkMode ? '#555' : '#e0e0e0') : '#4caf50') 
          }} />
        ))}
        {usedLives > worker.maxLives && [...Array(usedLives - worker.maxLives)].map((_, index) => (
          <div key={`extra-${index}`} style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#8b0000' }} />
        ))}
      </div>
    </div>
  );
}

function ShiftDropZone({ id, title, defaultTime, isDarkMode, staffCount, children }) {
  const { isOver, setNodeRef } = useDroppable({ id });
  
  const bgIdle = isDarkMode ? '#1e1e1e' : '#fff';
  const bgActive = isDarkMode ? '#1b3a20' : '#e8f5e9';
  const borderColor = isDarkMode ? '#444' : '#ccc';
  
  const counterColor = staffCount < 3 ? (isDarkMode ? '#ff8a80' : '#d32f2f') : '#4caf50';

  return (
    <div ref={setNodeRef} style={{ 
      minHeight: '80px', padding: '10px', borderRadius: '6px',
      border: `2px dashed ${borderColor}`, backgroundColor: isOver ? bgActive : bgIdle,
      transition: 'background-color 0.2s'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
        <h4 style={{ margin: 0, color: isDarkMode ? '#ccc' : '#555' }}>{title}</h4>
        <div style={{ fontSize: '0.8em', fontWeight: 'bold', color: counterColor, backgroundColor: isDarkMode ? '#333' : '#eee', padding: '2px 6px', borderRadius: '10px' }}>
          {staffCount}/3
        </div>
      </div>
      <div style={{ fontSize: '0.8em', color: isDarkMode ? '#888' : '#999', marginBottom: '10px' }}>{defaultTime}</div>
      {children}
    </div>
  );
}

function ShiftConfirmationModal({ pendingShift, onConfirm, onCancel, isDarkMode }) {
  const [isEditing, setIsEditing] = useState(false);
  const isMorning = pendingShift.zoneId.includes('am');
  const [startTime, setStartTime] = useState(isMorning ? '7:45 AM' : '2:00 PM');
  const [endTime, setEndTime] = useState(isMorning ? '5:45 PM' : 'Close');

  const modalBg = isDarkMode ? '#2c2c2c' : 'white';
  const textColor = isDarkMode ? '#e0e0e0' : 'black';
  const inputBg = isDarkMode ? '#1e1e1e' : 'white';
  const inputBorder = isDarkMode ? '#555' : '#ccc';

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
      <div style={{ backgroundColor: modalBg, color: textColor, padding: '20px', borderRadius: '8px', width: '300px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
        <h3 style={{ marginTop: 0 }}>Assign {pendingShift.worker.name}?</h3>
        <p style={{ color: isDarkMode ? '#aaa' : 'gray', fontSize: '0.9em' }}>Zone: <strong>{pendingShift.zoneId.toUpperCase()}</strong></p>

        {isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
            <label>Start 
              <select value={startTime} onChange={e => setStartTime(e.target.value)} style={{ width: '100%', padding: '6px', backgroundColor: inputBg, color: textColor, border: `1px solid ${inputBorder}`, borderRadius: '4px', marginTop: '4px' }}>
                {TIME_OPTIONS.map(time => <option key={`start-${time}`} value={time}>{time}</option>)}
              </select>
            </label>
            <label>End 
              <select value={endTime} onChange={e => setEndTime(e.target.value)} style={{ width: '100%', padding: '6px', backgroundColor: inputBg, color: textColor, border: `1px solid ${inputBorder}`, borderRadius: '4px', marginTop: '4px' }}>
                {TIME_OPTIONS.map(time => <option key={`end-${time}`} value={time}>{time}</option>)}
              </select>
            </label>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button onClick={() => onConfirm(startTime, endTime)} style={{ flex: 1, padding: '8px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
              <button onClick={onCancel} style={{ flex: 1, padding: '8px', backgroundColor: isDarkMode ? '#555' : '#e0e0e0', color: textColor, border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        ) : (
          <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <p><strong>Hours:</strong> {startTime} - {endTime}</p>
            <button onClick={() => onConfirm(startTime, endTime)} style={{ padding: '10px', backgroundColor: '#2196f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Confirm Default</button>
            <button onClick={() => setIsEditing(true)} style={{ padding: '8px', border: '1px solid #2196f3', color: '#2196f3', backgroundColor: 'transparent', borderRadius: '4px', cursor: 'pointer' }}>Edit Hours</button>
            <button onClick={onCancel} style={{ padding: '8px', border: 'none', color: isDarkMode ? '#aaa' : 'gray', backgroundColor: 'transparent', cursor: 'pointer' }}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 3. THE MAIN APP
// ==========================================
export default function App() {
  const [schedule, setSchedule] = useState(() => {
    // Check local storage for a saved schedule
    const savedSchedule = localStorage.getItem('dispensary-schedule');
    
    if (savedSchedule) {
      // If we found one, translate it from text back into JavaScript data
      return JSON.parse(savedSchedule); 
    }
    
    // If nothing was saved, return the empty week
    return initialSchedule; 
  });


// Autosave to localStorage whenever 'schedule' changes
  useEffect(() => {
    localStorage.setItem('dispensary-schedule', JSON.stringify(schedule));
  }, [schedule]);
  
  const [activeDragWorker, setActiveDragWorker] = useState(null);

  const [pendingShift, setPendingShift] = useState(null);
  
  const [isManagerView, setIsManagerView] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const mouseSensor = useSensor(MouseSensor);
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 250, tolerance: 5 },
  });
  const sensors = useSensors(mouseSensor, touchSensor);

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
// Autosave to localStorage whenever 'schedule' changes
  useEffect(() => {
    localStorage.setItem('dispensary-schedule', JSON.stringify(schedule));
  }, [schedule]);
  
  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveDragWorker(null);
    if (!over) return;

    const workerId = active.id;
    const [day, ampm] = over.id.split('-'); 

    const isAlreadyScheduled = schedule[day][ampm].some(shift => shift.workerId === workerId);
    if (isAlreadyScheduled) {
      alert(`${active.data.current.worker.name} is already scheduled for ${day} ${ampm.toUpperCase()}!`);
      return; 
    }

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

  const handleToggleManagerView = () => {
    if (isManagerView) {
      let understaffedAlerts = [];
      Object.keys(schedule).forEach(day => {
        const amCount = schedule[day].am.length;
        const pmCount = schedule[day].pm.length;
        if (amCount < 3) understaffedAlerts.push(`• ${day.toUpperCase()} AM (has ${amCount})`);
        if (pmCount < 3) understaffedAlerts.push(`• ${day.toUpperCase()} PM (has ${pmCount})`);
      });

      if (understaffedAlerts.length > 0) {
        const isSure = window.confirm(
          `WAIT! You have understaffed shifts:\n\n${understaffedAlerts.join('\n')}\n\nAre you sure you want to proceed to Public View?`
        );
        if (!isSure) return; 
      }
    }
    setIsManagerView(!isManagerView);
  };

  const mainBg = isDarkMode ? '#121212' : '#ffffff';
  const mainText = isDarkMode ? '#e0e0e0' : '#000000';
  const headerBorder = isDarkMode ? '#333' : '#eee';

  return (
    <div style={{ backgroundColor: mainBg, color: mainText, minHeight: '100vh', transition: 'all 0.3s' }}>
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div style={{ fontFamily: 'sans-serif', padding: '20px', width: '100%', boxSizing: 'border-box' }}>
          
          {/* Header & Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `2px solid ${headerBorder}`, paddingBottom: '10px', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <h1 style={{ margin: 0 }}>Shift Scheduler</h1>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={handleToggleManagerView}
                style={{ padding: '8px 16px', backgroundColor: isManagerView ? '#f44336' : '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                {isManagerView ? "🔒 Public View" : "🔓 Admin View"}
              </button>
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                style={{ padding: '8px 16px', backgroundColor: isDarkMode ? '#444' : '#e0e0e0', color: isDarkMode ? 'white' : 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                {isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
              </button>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            
            {/* THE BENCH */}
            {isManagerView && (
              <div style={{ width: '250px', flexShrink: 0, border: `2px dashed ${isDarkMode ? '#444' : '#ccc'}`, padding: '15px', borderRadius: '8px', backgroundColor: isDarkMode ? '#1a1a1a' : '#fdfdfd' }}>
                <h2 style={{ marginTop: 0 }}>The Bench</h2>
                {initialWorkers.map(worker => (
                  <DraggableWorker key={worker.id} worker={worker} usedLives={getUsedLives(worker.id)} isDarkMode={isDarkMode} />
                ))}
              </div>
            )}

            {/* THE CALENDAR */}
            <div style={{ flex: 1, minWidth: 0, overflowX: 'auto', paddingBottom: '10px', WebkitOverflowScrolling: 'touch' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', minWidth: '900px' }}>
                {Object.keys(schedule).map(day => (
                  <div key={day} style={{ border: `1px solid ${isDarkMode ? '#444' : '#ccc'}`, borderRadius: '8px', overflow: 'hidden', backgroundColor: isDarkMode ? '#1a1a1a' : '#fafafa' }}>
                    <div style={{ backgroundColor: isDarkMode ? '#333' : '#eee', padding: '10px', textAlign: 'center', fontWeight: 'bold', textTransform: 'capitalize' }}>
                      {day}
                    </div>
                    <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      
                      {/* AM Zone */}
                      <ShiftDropZone id={`${day}-am`} title="☀️ AM" defaultTime="7:45 - 5:45" isDarkMode={isDarkMode} staffCount={schedule[day].am.length}>
                        {schedule[day].am.map(shift => (
                          <div key={shift.id} style={{ position: 'relative', backgroundColor: isDarkMode ? '#0d47a1' : '#e3f2fd', padding: '8px', borderRadius: '4px', fontSize: '0.85em', marginTop: '5px', border: `1px solid ${isDarkMode ? '#1565c0' : '#bbdefb'}`, color: isDarkMode ? '#fff' : '#000' }}>
                            <strong>{shift.workerName}</strong><br/>{shift.startTime} - {shift.endTime}
                            {isManagerView && (
                              <button onClick={() => removeShift(day, 'am', shift.id)} style={{ position: 'absolute', top: '2px', right: '4px', background: 'transparent', border: 'none', color: isDarkMode ? '#ff8a80' : '#d32f2f', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2em' }}>×</button>
                            )}
                          </div>
                        ))}
                      </ShiftDropZone>

                      {/* PM Zone */}
                      <ShiftDropZone id={`${day}-pm`} title="🌙 PM" defaultTime="2:00 - Close" isDarkMode={isDarkMode} staffCount={schedule[day].pm.length}>
                        {schedule[day].pm.map(shift => (
                          <div key={shift.id} style={{ position: 'relative', backgroundColor: isDarkMode ? '#e65100' : '#fff3e0', padding: '8px', borderRadius: '4px', fontSize: '0.85em', marginTop: '5px', border: `1px solid ${isDarkMode ? '#ef6c00' : '#ffe0b2'}`, color: isDarkMode ? '#fff' : '#000' }}>
                            <strong>{shift.workerName}</strong><br/>{shift.startTime} - {shift.endTime}
                            {isManagerView && (
                              <button onClick={() => removeShift(day, 'pm', shift.id)} style={{ position: 'absolute', top: '2px', right: '4px', background: 'transparent', border: 'none', color: isDarkMode ? '#ff8a80' : '#d32f2f', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2em' }}>×</button>
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
        </div>

        {/* THE MODAL */}
        {pendingShift && (
          <ShiftConfirmationModal pendingShift={pendingShift} onConfirm={confirmShiftAssignment} onCancel={() => setPendingShift(null)} isDarkMode={isDarkMode} />
        )}

        {/* THE GHOST OVERLAY */}
        <DragOverlay>
          {activeDragWorker ? (
            <div style={{ padding: '12px', backgroundColor: isDarkMode ? '#2c2c2c' : 'white', color: isDarkMode ? '#e0e0e0' : 'black', border: '2px solid #2196f3', borderRadius: '6px', boxShadow: '0 5px 15px rgba(0,0,0,0.4)' }}>
              <strong>{activeDragWorker.name}</strong>
            </div>
          ) : null}
        </DragOverlay>

      </DndContext>
    </div>
  );
}
