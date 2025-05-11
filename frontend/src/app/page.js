"use client";

import { useContext, useState, useEffect } from "react";
import AuthContext from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import axios from "axios";

const Home = () => {
  const { user, logout } = useContext(AuthContext);

  const [workouts, setWorkouts] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [workoutName, setWorkoutName] = useState("");
  const [workoutDescription, setWorkoutDescription] = useState("");
  const [routineName, setRoutineName] = useState("");
  const [routineDescription, setRoutineDescription] = useState("");
  const [selectedWorkouts, setSelectedWorkouts] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const token =
    typeof window !== "undefined" && localStorage.getItem("access_token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchWorkoutsAndRoutines = async () => {
      try {
        if (!token) return;
        const [workoutResponse, routineResponse] = await Promise.all([
          axios.get("http://localhost:8000/workouts", { headers }),
          axios.get("http://localhost:8000/routines", { headers }),
        ]);
        setWorkouts(workoutResponse.data);
        setRoutines(routineResponse.data);
      } catch (error) {
        console.error(
          "Error fetching data:",
          error.response?.data || error.message
        );
      }
    };

    fetchWorkoutsAndRoutines();
  }, [refreshTrigger]);

  const handleCreateWorkout = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8000/workouts",
        { name: workoutName, description: workoutDescription },
        { headers }
      );
      setWorkoutName("");
      setWorkoutDescription("");
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error(
        "Error creating workout:",
        error.response?.data || error.message
      );
    }
  };

  const handleDeleteWorkout = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/workouts/${id}`, { headers });
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error(
        "Error deleting workout:",
        error.response?.data || error.message
      );
    }
  };

  const handleCreateRoutine = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:8000/routines",
        {
          name: routineName,
          description: routineDescription,
          workouts: selectedWorkouts,
        },
        { headers }
      );
      setRoutineName("");
      setRoutineDescription("");
      setSelectedWorkouts([]);
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error(
        "Error creating routine:",
        error.response?.data || error.message
      );
    }
  };

  const handleDeleteRoutine = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/routines?routine_id=${id}`, {
        headers,
      });
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error(
        "Error deleting routine:",
        error.response?.data || error.message
      );
    }
  };

  return (
    <ProtectedRoute>
      <div className="p-6 max-w-xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            Welcome, {user?.username || ""}!
          </h1>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            onClick={logout}
          >
            Logout
          </button>
        </div>

        {/* Workout Creation */}
        <section>
          <h2 className="text-xl font-semibold mb-2">Create New Workout</h2>
          <form onSubmit={handleCreateWorkout} className="space-y-4">
            <input
              type="text"
              placeholder="Workout Name"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded"
            />
            <textarea
              placeholder="Description"
              value={workoutDescription}
              onChange={(e) => setWorkoutDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Add Workout
            </button>
          </form>
        </section>

        {/* Routine Creation */}
        <section>
          <h2 className="text-xl font-semibold mt-6 mb-2">
            Create New Routine
          </h2>
          <form onSubmit={handleCreateRoutine} className="space-y-4">
            <input
              type="text"
              placeholder="Routine Name"
              value={routineName}
              onChange={(e) => setRoutineName(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded"
            />
            <textarea
              placeholder="Description"
              value={routineDescription}
              onChange={(e) => setRoutineDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
            <div>
              <label className="block text-sm font-medium mb-1">
                Select Workouts
              </label>
              <select
                multiple
                value={selectedWorkouts}
                onChange={(e) =>
                  setSelectedWorkouts(
                    Array.from(e.target.selectedOptions, (option) =>
                      parseInt(option.value)
                    )
                  )
                }
                className="w-full px-3 py-2 border rounded"
              >
                {workouts.map((workout) => (
                  <option key={workout.id} value={workout.id}>
                    {workout.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Add Routine
            </button>
          </form>
        </section>

        {/* Workouts List */}
        <section>
          <h2 className="text-xl font-semibold mt-6 mb-2">Your Workouts</h2>
          {workouts.length > 0 ? (
            <ul className="space-y-2">
              {workouts.map((workout) => (
                <li
                  key={workout.id}
                  className="p-4 border rounded bg-gray-50 dark:bg-gray-800"
                >
                  <h3 className="font-semibold">{workout.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {workout.description || "No description provided."}
                  </p>
                  <button
                    onClick={() => handleDeleteWorkout(workout.id)}
                    className="text-sm text-red-500 hover:underline mt-2"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No workouts yet.</p>
          )}
        </section>

        {/* Routines List */}
        <section>
          <h2 className="text-xl font-semibold mt-6 mb-2">
            Available Routines
          </h2>
          {routines.length > 0 ? (
            <ul className="space-y-2">
              {routines.map((routine) => (
                <li
                  key={routine.id}
                  className="p-4 border rounded bg-gray-50 dark:bg-gray-800"
                >
                  <h3 className="font-semibold">{routine.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {routine.description || "No description provided."}
                  </p>
                  <button
                    onClick={() => handleDeleteRoutine(routine.id)}
                    className="text-sm text-red-500 hover:underline mt-2"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No routines yet.</p>
          )}
        </section>
      </div>
    </ProtectedRoute>
  );
};

export default Home;
