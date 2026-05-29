import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";

export default function App() {
  const [tab, setTab] = React.useState("calendar");
  const [templates, setTemplates] = React.useState([]);
  const [logs, setLogs] = React.useState([]);
  const [selectedDate, setSelectedDate] = React.useState(null);
  const [selectedTemplate, setSelectedTemplate] =
    React.useState(null);
  const [currentYear, setCurrentYear] = React.useState(
    new Date().getFullYear(),
  );
  const [currentMonth, setCurrentMonth] = React.useState(
    new Date().getMonth(),
  );

  const [templateName, setTemplateName] = React.useState("");
  const [exercises, setExercises] = React.useState([]);
  const [editingTemplateId, setEditingTemplateId] =
    React.useState(null);
  const [templateColor, setTemplateColor] =
    React.useState("#3b82f6");

  const [loggingData, setLoggingData] = React.useState([]);
  const [editingWorkoutId, setEditingWorkoutId] =
    React.useState(null);
  const [workoutNotes, setWorkoutNotes] = React.useState("");

  const [timePeriod, setTimePeriod] = React.useState("month");
  const [muscleFilter, setMuscleFilter] = React.useState("all");
  const [selectedExercise, setSelectedExercise] =
    React.useState("");

  React.useEffect(() => {
    const t = localStorage.getItem("templates");
    const l = localStorage.getItem("logs");
    if (t) setTemplates(JSON.parse(t));
    if (l) setLogs(JSON.parse(l));
  }, []);

  React.useEffect(() => {
    localStorage.setItem(
      "templates",
      JSON.stringify(templates),
    );
  }, [templates]);

  React.useEffect(() => {
    localStorage.setItem("logs", JSON.stringify(logs));
  }, [logs]);

  React.useEffect(() => {
    if (
      !selectedDate ||
      !selectedTemplate ||
      loggingData.length === 0
    )
      return;

    const hasAnyData = loggingData.some((e) =>
      e.sets.some((s) => s.reps !== "" || s.weight !== ""),
    );

    if (!hasAnyData) return;

    const workout = {
      id: editingWorkoutId || "w" + Date.now(),
      date: selectedDate,
      templateName: selectedTemplate.name,
      templateColor: selectedTemplate.color,
      exercises: loggingData.map((e) => ({
        id: e.id,
        name: e.name,
        muscleGroups: e.muscleGroups || [],
        sets: e.sets,
      })),
      notes: workoutNotes,
    };

    const timeoutId = setTimeout(() => {
      if (editingWorkoutId) {
        setLogs(
          logs.map((w) =>
            w.id === editingWorkoutId ? workout : w,
          ),
        );
      } else {
        const existingWorkout = logs.find(
          (w) => w.date === selectedDate,
        );
        if (existingWorkout) {
          setLogs(
            logs.map((w) =>
              w.date === selectedDate ? workout : w,
            ),
          );
          if (!editingWorkoutId) {
            setEditingWorkoutId(existingWorkout.id);
          }
        } else {
          setLogs([...logs, workout]);
          setEditingWorkoutId(workout.id);
        }
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [
    loggingData,
    selectedDate,
    selectedTemplate,
    workoutNotes,
  ]);

  const saveTemplate = () => {
    if (!templateName.trim() || exercises.length === 0) return;

    if (editingTemplateId) {
      setTemplates(
        templates.map((t) =>
          t.id === editingTemplateId
            ? {
                ...t,
                name: templateName.trim(),
                color: templateColor,
                exercises: exercises.map((e, i) => ({
                  id: e.id || "e" + Date.now() + i,
                  name: e.name,
                  muscleGroups: e.muscleGroups || [],
                })),
              }
            : t,
        ),
      );
      setEditingTemplateId(null);
    } else {
      const template = {
        id: "t" + Date.now(),
        name: templateName.trim(),
        exercises: exercises.map((e, i) => ({
          id: "e" + Date.now() + i,
          name: e.name,
          muscleGroups: e.muscleGroups || [],
        })),
        color: templateColor,
      };
      setTemplates([...templates, template]);
    }

    setTemplateName("");
    setExercises([]);
    setTemplateColor("#3b82f6");
  };

  const deleteTemplate = (id) => {
    if (
      window.confirm(
        "Delete this template? This cannot be undone.",
      )
    ) {
      setTemplates(templates.filter((t) => t.id !== id));
    }
  };

  const editTemplate = (template) => {
    setEditingTemplateId(template.id);
    setTemplateName(template.name);
    setExercises(template.exercises.map((e) => ({ ...e })));
    setTemplateColor(template.color || "#3b82f6");
    setTab("templates");
  };

  const cancelEdit = () => {
    setEditingTemplateId(null);
    setTemplateName("");
    setExercises([]);
    setTemplateColor("#3b82f6");
  };

  const startLogging = (template) => {
    setSelectedTemplate(template);
    setWorkoutNotes("");
    setLoggingData(
      template.exercises.map((e) => ({
        id: e.id,
        name: e.name,
        muscleGroups: e.muscleGroups || [],
        sets: [
          { reps: "", weight: "", tilFail: false, tfReps: "" },
          { reps: "", weight: "", tilFail: false, tfReps: "" },
          { reps: "", weight: "", tilFail: false, tfReps: "" },
          { reps: "", weight: "", tilFail: false, tfReps: "" },
          { reps: "", weight: "", tilFail: false, tfReps: "" },
        ],
      })),
    );
    setTab("log");
  };

  const editWorkout = (workout) => {
    setEditingWorkoutId(workout.id);
    setSelectedDate(workout.date);
    setSelectedTemplate({
      name: workout.templateName,
      exercises: workout.exercises,
      color: workout.templateColor,
    });
    setLoggingData(
      workout.exercises.map((e) => ({
        ...e,
        muscleGroups: e.muscleGroups || [],
        sets:
          e.sets.length > 0
            ? e.sets.map((s) => ({
                reps: s.reps || "",
                weight: s.weight || "",
                tilFail: s.tilFail || false,
                tfReps: s.tfReps || "",
              }))
            : [
                {
                  reps: "",
                  weight: "",
                  tilFail: false,
                  tfReps: "",
                },
                {
                  reps: "",
                  weight: "",
                  tilFail: false,
                  tfReps: "",
                },
                {
                  reps: "",
                  weight: "",
                  tilFail: false,
                  tfReps: "",
                },
              ],
      })),
    );
    setWorkoutNotes(workout.notes || "");
    setTab("log");
  };

  const deleteWorkout = (workoutId) => {
    setLogs(logs.filter((w) => w.id !== workoutId));
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const formatDate = (year, month, day) => {
    const m = String(month + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${year}-${m}-${d}`;
  };

  const getWorkoutForDate = (dateStr) => {
    return logs.find((l) => l.date === dateStr);
  };

  const getPreviousWorkouts = (exerciseName, currentDate) => {
    return logs
      .filter((log) => log.date !== currentDate)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map((log) => {
        const exercise = log.exercises.find(
          (ex) => ex.name === exerciseName,
        );
        if (exercise) {
          return {
            date: log.date,
            sets: exercise.sets.filter(
              (s) => s.reps !== "" || s.weight !== "",
            ),
          };
        }
        return null;
      })
      .filter((w) => w !== null && w.sets.length > 0)
      .slice(0, 3);
  };

  const s = {
    container: {
      minHeight: "100vh",
      background: "#f8f9fa",
      fontFamily: "system-ui, sans-serif",
    },
    nav: {
      background: "#fff",
      borderBottom: "2px solid #e9ecef",
      padding: "0",
      display: "flex",
    },
    navBtn: {
      padding: "16px 24px",
      border: "none",
      background: "transparent",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "500",
      color: "#6c757d",
      borderBottomWidth: "2px",
      borderBottomStyle: "solid",
      borderBottomColor: "transparent",
      marginBottom: "-2px",
    },
    navBtnActive: { color: "#000", borderBottomColor: "#000" },
    content: {
      maxWidth: "900px",
      margin: "0 auto",
      padding: "24px",
    },
    card: {
      background: "#fff",
      border: "1px solid #e9ecef",
      borderRadius: "8px",
      padding: "24px",
      marginBottom: "16px",
    },
    h1: {
      fontSize: "24px",
      fontWeight: "600",
      marginTop: 0,
      marginBottom: "24px",
    },
    h2: {
      fontSize: "20px",
      fontWeight: "600",
      marginTop: 0,
      marginBottom: "16px",
    },
    h3: {
      fontSize: "16px",
      fontWeight: "600",
      marginTop: 0,
      marginBottom: "12px",
    },
    input: {
      width: "100%",
      padding: "10px 12px",
      border: "1px solid #dee2e6",
      borderRadius: "6px",
      fontSize: "14px",
      fontFamily: "inherit",
      boxSizing: "border-box",
    },
    btn: {
      padding: "10px 16px",
      border: "none",
      borderRadius: "6px",
      fontSize: "14px",
      fontWeight: "500",
      cursor: "pointer",
    },
    btnPri: { background: "#000", color: "#fff" },
    btnSec: {
      background: "#fff",
      color: "#000",
      border: "1px solid #dee2e6",
    },
    btnDanger: { background: "#dc3545", color: "#fff" },
    label: {
      display: "block",
      marginBottom: "8px",
      fontSize: "14px",
      fontWeight: "500",
    },
    flex: { display: "flex", gap: "8px", alignItems: "center" },
    cal: {
      display: "grid",
      gridTemplateColumns: "repeat(7, 1fr)",
      gap: "8px",
      marginTop: "16px",
    },
    calHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "16px",
    },
    dayHeader: {
      textAlign: "center",
      fontSize: "12px",
      fontWeight: "600",
      color: "#6c757d",
      padding: "8px",
    },
    day: {
      aspectRatio: "1",
      borderWidth: "2px",
      borderStyle: "solid",
      borderColor: "#e9ecef",
      borderRadius: "6px",
      padding: "8px",
      cursor: "pointer",
      fontSize: "14px",
      background: "#fff",
      position: "relative",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    },
    dayEmpty: { borderWidth: "0", cursor: "default" },
    dayToday: { borderColor: "#000", fontWeight: "600" },
    daySelected: {
      background: "#000",
      color: "#fff",
      borderColor: "#000",
    },
    templateCard: {
      background: "#f8f9fa",
      border: "1px solid #e9ecef",
      borderRadius: "6px",
      padding: "16px",
      marginBottom: "12px",
    },
    exerciseRow: {
      background: "#f8f9fa",
      border: "1px solid #e9ecef",
      borderRadius: "6px",
      padding: "12px",
      marginBottom: "8px",
    },
    setInput: {
      width: "60px",
      padding: "6px 8px",
      border: "1px solid #dee2e6",
      borderRadius: "4px",
      fontSize: "13px",
      textAlign: "center",
    },
  };

  const today = new Date();
  const todayStr = formatDate(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  if (tab === "calendar") {
    const daysInMonth = getDaysInMonth(
      currentYear,
      currentMonth,
    );
    const firstDay = getFirstDayOfMonth(
      currentYear,
      currentMonth,
    );
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    return (
      <div style={s.container}>
        <div style={s.nav}>
          <button
            style={{ ...s.navBtn, ...s.navBtnActive }}
            onClick={() => setTab("calendar")}
          >
            Calendar
          </button>
          <button
            style={s.navBtn}
            onClick={() => setTab("templates")}
          >
            Templates
          </button>
          <button
            style={s.navBtn}
            onClick={() => setTab("summary")}
          >
            Summary
          </button>
        </div>
        <div style={s.content}>
          <div style={s.card}>
            <div style={s.calHeader}>
              <button
                style={{ ...s.btn, ...s.btnSec }}
                onClick={() => {
                  if (currentMonth === 0) {
                    setCurrentMonth(11);
                    setCurrentYear(currentYear - 1);
                  } else {
                    setCurrentMonth(currentMonth - 1);
                  }
                }}
              >
                ←
              </button>
              <h2 style={{ ...s.h2, marginBottom: 0 }}>
                {monthNames[currentMonth]} {currentYear}
              </h2>
              <button
                style={{ ...s.btn, ...s.btnSec }}
                onClick={() => {
                  if (currentMonth === 11) {
                    setCurrentMonth(0);
                    setCurrentYear(currentYear + 1);
                  } else {
                    setCurrentMonth(currentMonth + 1);
                  }
                }}
              >
                →
              </button>
            </div>
            <div style={s.cal}>
              {[
                "Sun",
                "Mon",
                "Tue",
                "Wed",
                "Thu",
                "Fri",
                "Sat",
              ].map((day) => (
                <div key={day} style={s.dayHeader}>
                  {day}
                </div>
              ))}
              {days.map((day, i) => {
                if (day === null)
                  return (
                    <div
                      key={i}
                      style={{ ...s.day, ...s.dayEmpty }}
                    />
                  );
                const dateStr = formatDate(
                  currentYear,
                  currentMonth,
                  day,
                );
                const workout = getWorkoutForDate(dateStr);
                const isToday = dateStr === todayStr;
                const isSelected = dateStr === selectedDate;
                const workoutColor =
                  workout?.templateColor || "#1971c2";

                return (
                  <div
                    key={i}
                    style={{
                      ...s.day,
                      ...(isToday ? s.dayToday : {}),
                      ...(isSelected ? s.daySelected : {}),
                      ...(workout && !isSelected
                        ? {
                            background: workoutColor + "20",
                            borderColor: workoutColor,
                          }
                        : {}),
                    }}
                    onClick={() => setSelectedDate(dateStr)}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>

          {selectedDate && (
            <div style={s.card}>
              <h3 style={s.h3}>
                {new Date(
                  selectedDate + "T00:00:00",
                ).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h3>
              {getWorkoutForDate(selectedDate) ? (
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "12px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#6c757d",
                      }}
                    >
                      Workout:{" "}
                      <strong>
                        {
                          getWorkoutForDate(selectedDate)
                            .templateName
                        }
                      </strong>
                    </div>
                    <div
                      style={{ display: "flex", gap: "8px" }}
                    >
                      <button
                        style={{
                          ...s.btn,
                          ...s.btnSec,
                          fontSize: "12px",
                          padding: "6px 12px",
                        }}
                        onClick={() =>
                          editWorkout(
                            getWorkoutForDate(selectedDate),
                          )
                        }
                      >
                        Edit
                      </button>
                      <button
                        style={{
                          ...s.btn,
                          ...s.btnDanger,
                          fontSize: "12px",
                          padding: "6px 12px",
                        }}
                        onClick={() => {
                          if (
                            window.confirm(
                              "Delete this workout?",
                            )
                          ) {
                            deleteWorkout(
                              getWorkoutForDate(selectedDate)
                                .id,
                            );
                            setSelectedDate(null);
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  {getWorkoutForDate(
                    selectedDate,
                  ).exercises.map((ex) => {
                    const filledSets = Array.isArray(ex.sets)
                      ? ex.sets.filter(
                          (s) =>
                            s.reps !== "" || s.weight !== "",
                        )
                      : [];
                    return (
                      <div key={ex.id} style={s.exerciseRow}>
                        <div
                          style={{
                            fontWeight: "500",
                            marginBottom: "4px",
                          }}
                        >
                          {ex.name}
                        </div>
                        <div
                          style={{
                            fontSize: "13px",
                            color: "#6c757d",
                          }}
                        >
                          {(ex.muscleGroups || []).join(", ") ||
                            "No muscles"}{" "}
                          • {filledSets.length} sets
                        </div>
                        <div
                          style={{
                            marginTop: "8px",
                            display: "flex",
                            gap: "4px",
                            flexWrap: "wrap",
                          }}
                        >
                          {filledSets.map((set, i) => (
                            <span
                              key={i}
                              style={{
                                padding: "4px 8px",
                                background: "#fff",
                                border: "1px solid #dee2e6",
                                borderRadius: "4px",
                                fontSize: "12px",
                              }}
                            >
                              {set.weight &&
                                `${set.weight} lbs × `}
                              {set.reps} reps
                              {set.tilFail && set.tfReps
                                ? ` + ${set.tfReps} partial`
                                : ""}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {getWorkoutForDate(selectedDate).notes && (
                    <div
                      style={{
                        marginTop: "12px",
                        padding: "12px",
                        background: "#f8f9fa",
                        borderRadius: "6px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: "500",
                          marginBottom: "4px",
                          color: "#495057",
                        }}
                      >
                        Notes:
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#6c757d",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {getWorkoutForDate(selectedDate).notes}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#6c757d",
                      marginBottom: "16px",
                    }}
                  >
                    No workout logged for this date. Choose a
                    template:
                  </p>
                  {templates.map((t) => (
                    <div
                      key={t.id}
                      style={{
                        ...s.templateCard,
                        borderLeft: `4px solid ${t.color || "#3b82f6"}`,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontWeight: "500",
                              marginBottom: "4px",
                            }}
                          >
                            {t.name}
                          </div>
                          <div
                            style={{
                              fontSize: "13px",
                              color: "#6c757d",
                            }}
                          >
                            {t.exercises.length} exercises
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                          }}
                        >
                          <button
                            style={{ ...s.btn, ...s.btnPri }}
                            onClick={() => startLogging(t)}
                          >
                            Start
                          </button>
                          <button
                            style={{
                              ...s.btn,
                              ...s.btnSec,
                              fontSize: "12px",
                              padding: "8px 12px",
                            }}
                            onClick={() => deleteTemplate(t.id)}
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {templates.length === 0 && (
                    <p
                      style={{
                        fontSize: "14px",
                        color: "#6c757d",
                      }}
                    >
                      No templates available. Create one in the
                      Templates tab.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (tab === "templates") {
    const MuscleGroupSection = ({
      title,
      muscles,
      exerciseIndex,
    }) => (
      <div>
        <div
          style={{
            fontSize: "12px",
            fontWeight: "600",
            marginBottom: "4px",
            color: "#212529",
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "6px",
            fontSize: "13px",
          }}
        >
          {muscles.map((muscle) => (
            <label
              key={muscle.value}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={(
                  exercises[exerciseIndex].muscleGroups || []
                ).includes(muscle.value)}
                onChange={(e) => {
                  const arr = [...exercises];
                  const currentGroups =
                    arr[exerciseIndex].muscleGroups || [];
                  if (e.target.checked) {
                    arr[exerciseIndex] = {
                      ...arr[exerciseIndex],
                      muscleGroups: [
                        ...currentGroups,
                        muscle.value,
                      ],
                    };
                  } else {
                    arr[exerciseIndex] = {
                      ...arr[exerciseIndex],
                      muscleGroups: currentGroups.filter(
                        (m) => m !== muscle.value,
                      ),
                    };
                  }
                  setExercises(arr);
                }}
              />
              {muscle.label}
            </label>
          ))}
        </div>
      </div>
    );

    return (
      <div style={s.container}>
        <div style={s.nav}>
          <button
            style={s.navBtn}
            onClick={() => setTab("calendar")}
          >
            Calendar
          </button>
          <button
            style={{ ...s.navBtn, ...s.navBtnActive }}
            onClick={() => setTab("templates")}
          >
            Templates
          </button>
          <button
            style={s.navBtn}
            onClick={() => setTab("summary")}
          >
            Summary
          </button>
        </div>
        <div style={s.content}>
          <div style={s.card}>
            <h2 style={s.h2}>
              {editingTemplateId
                ? "Edit Template"
                : "Create Template"}
            </h2>
            {editingTemplateId && (
              <button
                style={{
                  ...s.btn,
                  ...s.btnSec,
                  marginBottom: "16px",
                }}
                onClick={cancelEdit}
              >
                Cancel Edit
              </button>
            )}
            <label style={s.label}>Template Name</label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g., Push Day, Pull Day"
              style={s.input}
            />
            <div style={{ height: "16px" }} />

            <label style={s.label}>Template Color</label>
            <div
              style={{
                display: "flex",
                gap: "8px",
                marginBottom: "16px",
                flexWrap: "wrap",
              }}
            >
              {[
                { color: "#3b82f6", name: "Blue" },
                { color: "#10b981", name: "Green" },
                { color: "#f59e0b", name: "Orange" },
                { color: "#ef4444", name: "Red" },
                { color: "#8b5cf6", name: "Purple" },
                { color: "#ec4899", name: "Pink" },
                { color: "#14b8a6", name: "Teal" },
                { color: "#6366f1", name: "Indigo" },
              ].map((c) => (
                <button
                  key={c.color}
                  onClick={() => setTemplateColor(c.color)}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "8px",
                    border:
                      templateColor === c.color
                        ? "3px solid #000"
                        : "2px solid #dee2e6",
                    background: c.color,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  title={c.name}
                />
              ))}
            </div>

            <label style={s.label}>Exercises</label>
            {exercises.map((ex, i) => (
              <div
                key={i}
                style={{
                  marginBottom: "16px",
                  padding: "12px",
                  background: "#f8f9fa",
                  borderRadius: "8px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    marginBottom: "8px",
                  }}
                >
                  <input
                    type="text"
                    value={ex.name}
                    onChange={(e) => {
                      const arr = [...exercises];
                      arr[i] = {
                        ...arr[i],
                        name: e.target.value,
                      };
                      setExercises(arr);
                    }}
                    placeholder="Exercise name"
                    style={{ ...s.input, flex: 1 }}
                  />
                  <button
                    onClick={() =>
                      setExercises(
                        exercises.filter((_, idx) => idx !== i),
                      )
                    }
                    style={{ ...s.btn, ...s.btnSec }}
                  >
                    ×
                  </button>
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "500",
                    marginBottom: "8px",
                    color: "#495057",
                  }}
                >
                  Muscle Groups:
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <MuscleGroupSection
                    title="Chest"
                    exerciseIndex={i}
                    muscles={[
                      {
                        label: "Upper Chest",
                        value: "Upper Chest",
                      },
                      {
                        label: "Mid Chest",
                        value: "Mid Chest",
                      },
                      {
                        label: "Lower Chest",
                        value: "Lower Chest",
                      },
                    ]}
                  />
                  <MuscleGroupSection
                    title="Back"
                    exerciseIndex={i}
                    muscles={[
                      {
                        label: "Upper Back",
                        value: "Upper Back",
                      },
                      { label: "Mid Back", value: "Mid Back" },
                      { label: "Lats", value: "Lats" },
                    ]}
                  />
                  <MuscleGroupSection
                    title="Legs"
                    exerciseIndex={i}
                    muscles={[
                      { label: "Quads", value: "Quads" },
                      {
                        label: "Hamstrings",
                        value: "Hamstrings",
                      },
                      {
                        label: "Adductors",
                        value: "Adductors",
                      },
                      {
                        label: "Abductors",
                        value: "Abductors",
                      },
                      { label: "Calves", value: "Calves" },
                    ]}
                  />
                  <MuscleGroupSection
                    title="Shoulders"
                    exerciseIndex={i}
                    muscles={[
                      {
                        label: "Front Delts",
                        value: "Front Delts",
                      },
                      {
                        label: "Side Delts",
                        value: "Side Delts",
                      },
                      {
                        label: "Rear Delts",
                        value: "Rear Delts",
                      },
                    ]}
                  />
                  <MuscleGroupSection
                    title="Arms"
                    exerciseIndex={i}
                    muscles={[
                      { label: "Biceps", value: "Biceps" },
                      { label: "Triceps", value: "Triceps" },
                      { label: "Forearms", value: "Forearms" },
                    ]}
                  />
                  <MuscleGroupSection
                    title="Core"
                    exerciseIndex={i}
                    muscles={[
                      { label: "Abs", value: "Abs" },
                      { label: "Obliques", value: "Obliques" },
                    ]}
                  />
                </div>
                {ex.muscleGroups &&
                  ex.muscleGroups.length > 0 && (
                    <div
                      style={{
                        marginTop: "8px",
                        fontSize: "12px",
                        color: "#6c757d",
                      }}
                    >
                      Selected: {ex.muscleGroups.join(", ")}
                    </div>
                  )}
              </div>
            ))}
            <button
              onClick={() =>
                setExercises([
                  ...exercises,
                  { name: "", muscleGroups: [] },
                ])
              }
              style={{ ...s.btn, ...s.btnSec, width: "100%" }}
            >
              + Add Exercise
            </button>
            <div style={{ height: "16px" }} />
            <button
              onClick={saveTemplate}
              style={{ ...s.btn, ...s.btnPri, width: "100%" }}
            >
              {editingTemplateId
                ? "Update Template"
                : "Save Template"}
            </button>
          </div>

          <h2 style={s.h2}>My Templates</h2>
          {templates.map((t) => (
            <div
              key={t.id}
              style={{
                ...s.card,
                borderLeft: `4px solid ${t.color || "#3b82f6"}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3 style={s.h3}>{t.name}</h3>
                  {t.exercises.map((e) => (
                    <div
                      key={e.id}
                      style={{
                        fontSize: "14px",
                        color: "#6c757d",
                        marginBottom: "4px",
                      }}
                    >
                      • {e.name} (
                      {(e.muscleGroups || []).join(", ") ||
                        "No muscles selected"}
                      )
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => editTemplate(t)}
                    style={{ ...s.btn, ...s.btnSec }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteTemplate(t.id)}
                    style={{ ...s.btn, ...s.btnDanger }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {templates.length === 0 && (
            <div style={s.card}>
              <p
                style={{
                  fontSize: "14px",
                  color: "#6c757d",
                  margin: 0,
                }}
              >
                No templates yet. Create one above!
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (tab === "log") {
    return (
      <div style={s.container}>
        <div style={s.nav}>
          <button
            style={s.navBtn}
            onClick={() => setTab("calendar")}
          >
            Calendar
          </button>
          <button
            style={s.navBtn}
            onClick={() => setTab("templates")}
          >
            Templates
          </button>
          <button
            style={s.navBtn}
            onClick={() => setTab("summary")}
          >
            Summary
          </button>
        </div>
        <div style={s.content}>
          <div style={s.card}>
            <h2 style={s.h2}>
              {editingWorkoutId ? "Editing" : "Logging"}:{" "}
              {selectedTemplate?.name}
            </h2>
            <div
              style={{
                fontSize: "14px",
                color: "#6c757d",
                marginBottom: "8px",
              }}
            >
              Date:{" "}
              {selectedDate &&
                new Date(
                  selectedDate + "T00:00:00",
                ).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#28a745",
                marginBottom: "16px",
              }}
            >
              ✓ Auto-saving as you type...
            </div>
          </div>

          {loggingData.map((ex, exIdx) => {
            const previousWorkouts = getPreviousWorkouts(
              ex.name,
              selectedDate,
            );

            return (
              <div key={ex.id} style={s.card}>
                <h3 style={s.h3}>{ex.name}</h3>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#6c757d",
                    marginBottom: "12px",
                  }}
                >
                  {(ex.muscleGroups || []).join(", ") ||
                    "No muscles selected"}
                </div>

                {previousWorkouts.length > 0 && (
                  <div
                    style={{
                      marginBottom: "12px",
                      padding: "10px",
                      background: "#f8f9fa",
                      borderRadius: "6px",
                      border: "1px solid #e9ecef",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        marginBottom: "6px",
                        color: "#495057",
                      }}
                    >
                      Previous Workouts:
                    </div>
                    {previousWorkouts.map((pw, pwIdx) => (
                      <div
                        key={pwIdx}
                        style={{
                          fontSize: "11px",
                          color: "#6c757d",
                          marginBottom: "4px",
                        }}
                      >
                        <strong>
                          {new Date(
                            pw.date + "T00:00:00",
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                          :
                        </strong>{" "}
                        {pw.sets.map((set, idx) => {
                          const setStr = set.weight
                            ? `${set.weight}×${set.reps}`
                            : `${set.reps}`;
                          const tfStr =
                            set.tilFail && set.tfReps
                              ? ` +${set.tfReps}tf`
                              : "";
                          return (
                            <span key={idx}>
                              {setStr}
                              {tfStr}
                              {idx < pw.sets.length - 1
                                ? ", "
                                : ""}
                            </span>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}

                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "500",
                    marginBottom: "8px",
                  }}
                >
                  Weight & Reps per set:
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  {ex.sets.map((set, setIdx) => (
                    <div key={setIdx}>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#6c757d",
                          marginBottom: "4px",
                          textAlign: "center",
                        }}
                      >
                        Set {setIdx + 1}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                          width: "100%",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: "4px",
                            alignItems: "center",
                          }}
                        >
                          <input
                            type="number"
                            value={set.weight}
                            onChange={(e) => {
                              const newData = [...loggingData];
                              newData[exIdx].sets[
                                setIdx
                              ].weight = e.target.value;
                              setLoggingData(newData);
                            }}
                            placeholder="lbs"
                            style={{
                              ...s.setInput,
                              width: "55px",
                            }}
                          />
                          <span
                            style={{
                              fontSize: "11px",
                              color: "#6c757d",
                            }}
                          >
                            ×
                          </span>
                          <input
                            type="number"
                            value={set.reps}
                            onChange={(e) => {
                              const newData = [...loggingData];
                              newData[exIdx].sets[setIdx].reps =
                                e.target.value;
                              setLoggingData(newData);
                            }}
                            placeholder="reps"
                            style={{
                              ...s.setInput,
                              width: "55px",
                            }}
                          />
                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "2px",
                              fontSize: "11px",
                              marginLeft: "4px",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={set.tilFail}
                              onChange={(e) => {
                                const newData = [
                                  ...loggingData,
                                ];
                                newData[exIdx].sets[
                                  setIdx
                                ].tilFail = e.target.checked;
                                setLoggingData(newData);
                              }}
                            />
                            tf
                          </label>
                        </div>
                        {set.tilFail && (
                          <div
                            style={{
                              display: "flex",
                              gap: "4px",
                              alignItems: "center",
                              paddingLeft: "4px",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "11px",
                                color: "#6c757d",
                              }}
                            >
                              +
                            </span>
                            <input
                              type="number"
                              value={set.tfReps}
                              onChange={(e) => {
                                const newData = [
                                  ...loggingData,
                                ];
                                newData[exIdx].sets[
                                  setIdx
                                ].tfReps = e.target.value;
                                setLoggingData(newData);
                              }}
                              placeholder="partial"
                              style={{
                                ...s.setInput,
                                width: "55px",
                              }}
                            />
                            <span
                              style={{
                                fontSize: "10px",
                                color: "#6c757d",
                              }}
                            >
                              partial reps
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <div style={s.card}>
            <label style={s.label}>Workout Notes</label>
            <textarea
              value={workoutNotes}
              onChange={(e) => setWorkoutNotes(e.target.value)}
              placeholder="How did you feel during this workout? Any observations..."
              style={{
                ...s.input,
                minHeight: "80px",
                resize: "vertical",
                fontFamily: "inherit",
              }}
            />
          </div>

          <div style={{ ...s.flex, marginTop: "16px" }}>
            <button
              onClick={() => {
                setTab("calendar");
                setSelectedTemplate(null);
                setLoggingData([]);
                setEditingWorkoutId(null);
                setWorkoutNotes("");
              }}
              style={{ ...s.btn, ...s.btnSec, flex: 1 }}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setTab("calendar");
                setSelectedTemplate(null);
                setLoggingData([]);
                setEditingWorkoutId(null);
                setWorkoutNotes("");
              }}
              style={{ ...s.btn, ...s.btnPri, flex: 1 }}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (tab === "summary") {
    // Get all unique exercises
    const allExercises = [
      ...new Set(
        logs.flatMap((log) =>
          log.exercises.map((ex) => ex.name),
        ),
      ),
    ].sort();

    // Filter logs by time period
    const getFilteredLogs = () => {
      const now = new Date();
      const startDate = new Date();

      if (timePeriod === "week") {
        startDate.setDate(now.getDate() - 7);
      } else if (timePeriod === "month") {
        startDate.setMonth(now.getMonth() - 1);
      } else if (timePeriod === "year") {
        startDate.setFullYear(now.getFullYear() - 1);
      }

      return logs
        .filter((log) => {
          const logDate = new Date(log.date + "T00:00:00");
          return logDate >= startDate;
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    };

    const filteredLogs = getFilteredLogs();

    // Calculate 1RM using Epley formula: weight × (1 + reps/30)
    const calculate1RM = (weight, reps) => {
      if (!weight || !reps || reps === 0) return 0;
      return Math.round(weight * (1 + reps / 30));
    };

    // Weight progression data for selected exercise
    const getWeightProgressionData = () => {
      if (!selectedExercise) return [];

      const data = [];
      filteredLogs.forEach((log) => {
        const exercise = log.exercises.find(
          (ex) => ex.name === selectedExercise,
        );
        if (exercise) {
          const filledSets = exercise.sets.filter(
            (s) => s.weight && s.reps,
          );
          if (filledSets.length > 0) {
            const avgWeight =
              filledSets.reduce(
                (sum, s) => sum + parseFloat(s.weight),
                0,
              ) / filledSets.length;
            const maxWeight = Math.max(
              ...filledSets.map((s) => parseFloat(s.weight)),
            );
            data.push({
              date: new Date(log.date).toLocaleDateString(
                "en-US",
                { month: "short", day: "numeric" },
              ),
              "Avg Weight": Math.round(avgWeight),
              "Max Weight": maxWeight,
            });
          }
        }
      });
      return data;
    };

    // Volume progression data (sets × reps × weight)
    const getVolumeProgressionData = () => {
      if (!selectedExercise) return [];

      const data = [];
      filteredLogs.forEach((log) => {
        const exercise = log.exercises.find(
          (ex) => ex.name === selectedExercise,
        );
        if (exercise) {
          const filledSets = exercise.sets.filter(
            (s) => s.weight && s.reps,
          );
          const totalVolume = filledSets.reduce((sum, s) => {
            const reps = parseInt(s.reps) || 0;
            const tfReps = s.tilFail
              ? parseInt(s.tfReps) || 0
              : 0;
            const weight = parseFloat(s.weight) || 0;
            return sum + (reps + tfReps) * weight;
          }, 0);

          if (totalVolume > 0) {
            data.push({
              date: new Date(log.date).toLocaleDateString(
                "en-US",
                { month: "short", day: "numeric" },
              ),
              Volume: Math.round(totalVolume),
            });
          }
        }
      });
      return data;
    };

    // Strength progression data (estimated 1RM)
    const getStrengthProgressionData = () => {
      if (!selectedExercise) return [];

      const data = [];
      filteredLogs.forEach((log) => {
        const exercise = log.exercises.find(
          (ex) => ex.name === selectedExercise,
        );
        if (exercise) {
          const filledSets = exercise.sets.filter(
            (s) => s.weight && s.reps,
          );
          if (filledSets.length > 0) {
            // Calculate best estimated 1RM from all sets
            const best1RM = Math.max(
              ...filledSets.map((s) =>
                calculate1RM(
                  parseFloat(s.weight),
                  parseInt(s.reps),
                ),
              ),
            );

            // Also track best 5-rep max
            const fiveRepSets = filledSets.filter(
              (s) => parseInt(s.reps) >= 5,
            );
            const best5RM =
              fiveRepSets.length > 0
                ? Math.max(
                    ...fiveRepSets.map((s) =>
                      parseFloat(s.weight),
                    ),
                  )
                : null;

            data.push({
              date: new Date(log.date).toLocaleDateString(
                "en-US",
                { month: "short", day: "numeric" },
              ),
              "Est. 1RM": best1RM,
              ...(best5RM && { "Best 5-Rep": best5RM }),
            });
          }
        }
      });
      return data;
    };

    // Muscle group stats
    const muscleGroupCategories = {
      chest: ["Upper Chest", "Mid Chest", "Lower Chest"],
      back: ["Upper Back", "Mid Back", "Lats"],
      legs: [
        "Quads",
        "Hamstrings",
        "Adductors",
        "Abductors",
        "Calves",
      ],
      shoulders: ["Front Delts", "Side Delts", "Rear Delts"],
      arms: ["Biceps", "Triceps", "Forearms"],
      core: ["Abs", "Obliques"],
    };

    const getMuscleGroupsToShow = () => {
      if (muscleFilter === "all") {
        return Object.values(muscleGroupCategories).flat();
      }
      return muscleGroupCategories[muscleFilter] || [];
    };

    const muscleGroupsToShow = getMuscleGroupsToShow();
    const muscleGroupData = {};

    filteredLogs.forEach((log) => {
      log.exercises.forEach((ex) => {
        const exerciseMuscleGroups = ex.muscleGroups || [];
        exerciseMuscleGroups.forEach((muscleGroup) => {
          if (muscleGroupsToShow.includes(muscleGroup)) {
            if (!muscleGroupData[muscleGroup]) {
              muscleGroupData[muscleGroup] = {
                sets: 0,
                reps: 0,
              };
            }
            const filledSets = Array.isArray(ex.sets)
              ? ex.sets.filter(
                  (s) => s.reps !== "" || s.weight !== "",
                )
              : [];
            muscleGroupData[muscleGroup].sets +=
              filledSets.length;
            filledSets.forEach((set) => {
              const reps = parseInt(set.reps) || 0;
              const tfReps = set.tilFail
                ? parseInt(set.tfReps) || 0
                : 0;
              muscleGroupData[muscleGroup].reps +=
                reps + tfReps;
            });
          }
        });
      });
    });

    const chartData = Object.entries(muscleGroupData).map(
      ([muscle, data]) => ({
        muscle: muscle,
        sets: data.sets,
        reps: data.reps,
      }),
    );

    const weightData = getWeightProgressionData();
    const volumeData = getVolumeProgressionData();
    const strengthData = getStrengthProgressionData();

    return (
      <div style={s.container}>
        <div style={s.nav}>
          <button
            style={s.navBtn}
            onClick={() => setTab("calendar")}
          >
            Calendar
          </button>
          <button
            style={s.navBtn}
            onClick={() => setTab("templates")}
          >
            Templates
          </button>
          <button
            style={{ ...s.navBtn, ...s.navBtnActive }}
            onClick={() => setTab("summary")}
          >
            Summary
          </button>
        </div>
        <div style={s.content}>
          <div style={s.card}>
            <h2 style={s.h2}>Workout Summary & Analytics</h2>
            <div
              style={{
                fontSize: "14px",
                color: "#6c757d",
                marginBottom: "16px",
              }}
            >
              Total workouts: <strong>{logs.length}</strong>
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                marginBottom: "16px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <label
                  style={{ ...s.label, marginBottom: "4px" }}
                >
                  Time Period
                </label>
                <select
                  value={timePeriod}
                  onChange={(e) =>
                    setTimePeriod(e.target.value)
                  }
                  style={{ ...s.input, width: "auto" }}
                >
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="year">Last Year</option>
                </select>
              </div>
              <div>
                <label
                  style={{ ...s.label, marginBottom: "4px" }}
                >
                  Muscle Filter
                </label>
                <select
                  value={muscleFilter}
                  onChange={(e) =>
                    setMuscleFilter(e.target.value)
                  }
                  style={{ ...s.input, width: "auto" }}
                >
                  <option value="all">All Muscles</option>
                  <option value="chest">Chest Related</option>
                  <option value="back">Back Related</option>
                  <option value="legs">Legs Related</option>
                  <option value="shoulders">
                    Shoulders Related
                  </option>
                  <option value="arms">Arms Related</option>
                  <option value="core">Core Related</option>
                </select>
              </div>
            </div>
          </div>

          {/* Exercise-specific analytics */}
          <div style={s.card}>
            <h2 style={s.h2}>Exercise Progression Analytics</h2>
            <label style={{ ...s.label, marginBottom: "4px" }}>
              Select Exercise
            </label>
            <select
              value={selectedExercise}
              onChange={(e) =>
                setSelectedExercise(e.target.value)
              }
              style={{
                ...s.input,
                width: "100%",
                marginBottom: "16px",
              }}
            >
              <option value="">Choose an exercise...</option>
              {allExercises.map((ex) => (
                <option key={ex} value={ex}>
                  {ex}
                </option>
              ))}
            </select>
          </div>

          {selectedExercise && weightData.length > 0 && (
            <>
              <h3 style={s.h3}>
                Weight Progression - {selectedExercise}
              </h3>
              <div style={s.card}>
                <div style={{ width: "100%", height: "300px" }}>
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <LineChart data={weightData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        style={{ fontSize: "12px" }}
                      />
                      <YAxis
                        label={{
                          value: "Weight (lbs)",
                          angle: -90,
                          position: "insideLeft",
                        }}
                      />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="Avg Weight"
                        stroke="#3b82f6"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="Max Weight"
                        stroke="#10b981"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <h3 style={{ ...s.h3, marginTop: "24px" }}>
                Volume Progression - {selectedExercise}
              </h3>
              <div style={s.card}>
                <div style={{ width: "100%", height: "300px" }}>
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <LineChart data={volumeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        style={{ fontSize: "12px" }}
                      />
                      <YAxis
                        label={{
                          value: "Volume (lbs)",
                          angle: -90,
                          position: "insideLeft",
                        }}
                      />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="Volume"
                        stroke="#f59e0b"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div
                  style={{
                    marginTop: "12px",
                    fontSize: "13px",
                    color: "#6c757d",
                  }}
                >
                  Volume = Sets × Reps × Weight
                </div>
              </div>

              <h3 style={{ ...s.h3, marginTop: "24px" }}>
                Strength Progression - {selectedExercise}
              </h3>
              <div style={s.card}>
                <div style={{ width: "100%", height: "300px" }}>
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <LineChart data={strengthData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        style={{ fontSize: "12px" }}
                      />
                      <YAxis
                        label={{
                          value: "Weight (lbs)",
                          angle: -90,
                          position: "insideLeft",
                        }}
                      />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="Est. 1RM"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                      />
                      {strengthData.some(
                        (d) => d["Best 5-Rep"],
                      ) && (
                        <Line
                          type="monotone"
                          dataKey="Best 5-Rep"
                          stroke="#ec4899"
                          strokeWidth={2}
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div
                  style={{
                    marginTop: "12px",
                    fontSize: "13px",
                    color: "#6c757d",
                  }}
                >
                  Estimated 1RM calculated using Epley formula:
                  Weight × (1 + Reps/30)
                </div>
              </div>
            </>
          )}

          {selectedExercise && weightData.length === 0 && (
            <div style={s.card}>
              <p
                style={{
                  fontSize: "14px",
                  color: "#6c757d",
                  margin: 0,
                }}
              >
                No data available for this exercise in the
                selected time period.
              </p>
            </div>
          )}

          {/* Muscle group stats */}
          {chartData.length > 0 ? (
            <>
              <h3 style={{ ...s.h3, marginTop: "24px" }}>
                Sets by Muscle Group
              </h3>
              <div style={s.card}>
                <div style={{ width: "100%", height: "300px" }}>
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="muscle"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        style={{ fontSize: "12px" }}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="sets" fill="#0d6efd" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <h3 style={{ ...s.h3, marginTop: "24px" }}>
                Reps by Muscle Group
              </h3>
              <div style={s.card}>
                <div style={{ width: "100%", height: "300px" }}>
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="muscle"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        style={{ fontSize: "12px" }}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="reps" fill="#198754" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <h3 style={{ ...s.h3, marginTop: "24px" }}>
                Detailed Stats
              </h3>
              {Object.entries(muscleGroupData).map(
                ([muscle, data]) => (
                  <div key={muscle} style={s.card}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontWeight: "500",
                            marginBottom: "4px",
                          }}
                        >
                          {muscle}
                        </div>
                        <div
                          style={{
                            fontSize: "13px",
                            color: "#6c757d",
                          }}
                        >
                          {data.sets} sets • {data.reps} total
                          reps
                        </div>
                      </div>
                    </div>
                  </div>
                ),
              )}
            </>
          ) : (
            <div style={s.card}>
              <p
                style={{
                  fontSize: "14px",
                  color: "#6c757d",
                  margin: 0,
                }}
              >
                No workout data for the selected period.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}