import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Sparkles, 
  Loader2, 
  Clock,
  ListTodo
} from 'lucide-react';
import { Todo, Priority, SmartSuggestion } from './types';
import { getTodos, createTodo, toggleTodoStatus, deleteTodoAction } from './actions';
import { getSmartSuggestion } from './geminiService';

const PriorityBadge = ({ priority }: { priority: Priority }) => {
  const styles = {
    [Priority.LOW]: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    [Priority.MEDIUM]: 'bg-amber-50 text-amber-600 border-amber-100',
    [Priority.HIGH]: 'bg-rose-50 text-rose-600 border-rose-100',
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${styles[priority]}`}>
      {priority}
    </span>
  );
};

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [aiLoadingId, setAiLoadingId] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<SmartSuggestion | null>(null);

  const fetchTodos = useCallback(async () => {
    try {
      const data = await getTodos();
      setTodos(data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleAddTodo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const title = formData.get('title') as string;

    if (!title.trim()) return;

    setIsAdding(true);
    try {
      await createTodo(formData);
      form.reset();
      await fetchTodos();
    } catch (error) {
      console.error("Add error:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !currentStatus } : t));
      await toggleTodoStatus(id, !currentStatus);
      await fetchTodos();
    } catch (error) {
      console.error("Toggle error:", error);
      fetchTodos(); 
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setTodos(prev => prev.filter(t => t.id !== id));
      await deleteTodoAction(id);
    } catch (error) {
      console.error("Delete error:", error);
      fetchTodos();
    }
  };

  const handleAIHelp = async (todo: Todo) => {
    if (aiLoadingId) return;
    setAiLoadingId(todo.id);
    setSuggestion(null);
    try {
      const result = await getSmartSuggestion(todo.title);
      setSuggestion(result);
    } catch (error) {
      console.error("AI Service error:", error);
    } finally {
      setAiLoadingId(null);
    }
  };

  const completedCount = todos.filter(t => t.completed).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-100">
      <div className="max-w-2xl mx-auto px-4 py-12 md:py-24">
        <header className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
                <ListTodo className="w-6 h-6 text-white" />
              </div>
              TaskFlow Pro
            </h1>
            <p className="mt-2 text-slate-500 font-medium">Elevate your daily workflow.</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-slate-900">{completedCount}/{todos.length}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Completed</div>
          </div>
        </header>

        <main className="space-y-6">
          <div className="bg-white p-2 rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100">
            <form onSubmit={handleAddTodo} className="flex flex-col md:flex-row gap-2">
              <input
                type="text"
                name="title"
                placeholder="Type a task and hit enter..."
                className="flex-1 px-6 py-4 bg-transparent outline-none text-slate-700 font-medium placeholder:text-slate-300"
                required
                autoComplete="off"
              />
              <div className="flex gap-2 p-1">
                <select 
                  name="priority"
                  className="px-4 py-2 bg-slate-50 rounded-2xl text-sm font-semibold text-slate-600 outline-none border border-transparent focus:border-slate-200 transition-colors"
                >
                  <option value={Priority.LOW}>Low</option>
                  <option value={Priority.MEDIUM}>Med</option>
                  <option value={Priority.HIGH}>High</option>
                </select>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="bg-slate-900 hover:bg-black disabled:bg-slate-400 text-white px-6 py-2 rounded-2xl font-bold transition-all flex items-center gap-2 active:scale-95"
                >
                  {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Add</span>
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
            <div className="divide-y divide-slate-50">
              {isLoading ? (
                <div className="p-20 text-center space-y-4">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
                  <p className="text-slate-400 font-medium">Fetching your agenda...</p>
                </div>
              ) : todos.length === 0 ? (
                <div className="p-20 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-slate-200" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">Clear skies ahead</h3>
                  <p className="text-slate-400 text-sm mt-1">You've completed everything for now.</p>
                </div>
              ) : (
                todos.map((todo) => (
                  <div key={todo.id} className="group p-5 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => handleToggle(todo.id, todo.completed)}
                        className="flex-shrink-0 transition-transform active:scale-90"
                        aria-label={todo.completed ? "Mark as incomplete" : "Mark as complete"}
                      >
                        {todo.completed ? (
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shadow-md shadow-blue-100">
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 border-2 border-slate-200 rounded-full group-hover:border-blue-400 transition-colors" />
                        )}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-sm md:text-base font-semibold truncate transition-all ${todo.completed ? 'text-slate-300 line-through' : 'text-slate-700'}`}>
                            {todo.title}
                          </span>
                          <PriorityBadge priority={todo.priority} />
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                           <Clock className="w-3 h-3" />
                           {new Date(todo.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => handleAIHelp(todo)}
                          disabled={aiLoadingId === todo.id}
                          title="Get AI Suggestions"
                          className={`p-2 rounded-xl transition-all ${aiLoadingId === todo.id ? 'bg-purple-50 text-purple-600' : 'text-slate-300 hover:text-purple-600 hover:bg-purple-50'}`}
                        >
                          {aiLoadingId === todo.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Sparkles className="w-4 h-4" />
                          )}
                        </button>
                        <button 
                          onClick={() => handleDelete(todo.id)}
                          title="Delete Task"
                          className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {suggestion && aiLoadingId === null && todos.some(t => t.id === todo.id) && (
                      <div className="mt-4 ml-10 animate-fade-in">
                        <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-3 h-3 text-purple-600" />
                              <span className="text-[10px] font-black text-purple-700 uppercase tracking-widest">AI Refinement</span>
                            </div>
                            <button onClick={() => setSuggestion(null)} className="text-purple-300 hover:text-purple-600">
                              <Plus className="w-3 h-3 rotate-45" />
                            </button>
                          </div>
                          <p className="text-sm font-bold text-purple-900">{suggestion.refinedTitle}</p>
                          <div className="space-y-2">
                            {suggestion.subtasks.map((step, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs text-purple-600 font-medium">
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-300" />
                                {step}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
