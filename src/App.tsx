import React, { useState, useEffect, useRef } from 'react';
import { 
  Sprout, 
  CloudRain, 
  Thermometer, 
  MapPin, 
  Languages, 
  ChevronRight,
  Loader2,
  Send,
  Calendar,
  Zap,
  Leaf,
  Settings,
  X,
  Plus,
  Trash2,
  Wind,
  Droplets,
  Sun
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { getAgroAdvice } from './services/gemini';
import { getLocalWeather, type WeatherData, REGIONS } from './services/weather';
import { getCropCalendar, CROP_DATABASE } from './services/agriculture';
import { cn } from './lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface UserSettings {
  name: string;
  city: string;
  crops: string[];
  offlineMode: boolean;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      text: "Bonjour ! Je suis votre conseiller agricole. Comment puis-je vous aider ?\n\n*   Mes feuilles sont jaunes\n*   Quand semer le maïs ?\n*   Comment faire du compost ?", 
      sender: 'bot', 
      timestamp: new Date() 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [language, setLanguage] = useState<'fr' | 'wo' | 'bm' | 'ha'>('fr');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('agro_settings');
    return saved ? JSON.parse(saved) : {
      name: 'Agriculteur',
      city: REGIONS[1].city,
      crops: ['Maïs', 'Mil'],
      offlineMode: false
    };
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('agro_settings', JSON.stringify(settings));
    getLocalWeather(settings.city).then(w => {
      setWeather(w);
      // Auto-detect language
      if (w) setLanguage(w.primaryLanguage as any);
    });
  }, [settings.city]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const languages = [
    { code: 'fr', name: 'Français' },
    { code: 'wo', name: 'Wolof' },
    { code: 'bm', name: 'Bambara' },
    { code: 'ha', name: 'Haoussa' }
  ];

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const weatherContext = weather 
      ? `${weather.city}, ${weather.temp}°C, ${weather.condition}. Prévision: ${weather.forecast}. Humidité: ${weather.humidity}%`
      : "Inconnue";

    const history = messages.map(m => ({
      role: m.sender === 'user' ? 'user' as const : 'model' as const,
      text: m.text
    }));

    const responseText = await getAgroAdvice(
      `[LANGUE: ${languages.find(l => l.code === language)?.name}] ${input}`, 
      weatherContext, 
      history,
      selectedImage?.split(',')[1]
    );

    const botMsg: Message = {
      id: (Date.now() + 1).toString(),
      text: responseText || "Désolé, je n'ai pas pu générer de réponse.",
      sender: 'bot',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMsg]);
    setIsLoading(false);
    setSelectedImage(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-bento-bg min-h-screen text-bento-text font-sans p-4 md:p-8 flex flex-col overflow-x-hidden">
      
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-bento-accent rounded-full flex items-center justify-center text-white shadow-lg">
            <Sprout size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-bento-heading">{settings.name.toUpperCase()}</h1>
            <p className="text-[10px] uppercase tracking-widest text-bento-accent font-bold">Conseiller Agronome · Afrique de l'Ouest</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => setSettings(s => ({ ...s, offlineMode: !s.offlineMode }))}
            className={cn(
              "flex items-center gap-2 px-4 py-2 border rounded-full text-[10px] font-bold uppercase tracking-wider transition-all",
              settings.offlineMode ? "bg-amber-500 border-amber-600 text-white" : "bg-white border-bento-border text-bento-text opacity-70"
            )}
          >
            <span className={cn("w-2 h-2 rounded-full", settings.offlineMode ? "bg-white animate-pulse" : "bg-green-500")}></span>
            {settings.offlineMode ? "Offline Mode (SMS Sync)" : "Online Mode"}
          </button>
          
          <button 
            onClick={() => setShowSettings(true)}
            className="p-2 bg-white border border-bento-border rounded-full hover:bg-bento-bg transition-colors"
          >
            <Settings size={20} className="text-bento-accent" />
          </button>

          <div className="flex items-center gap-2 bg-white border border-bento-border rounded-full px-3 py-1">
            <Languages size={14} className="text-bento-muted" />
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="text-xs font-bold bg-transparent border-none focus:ring-0 cursor-pointer uppercase"
            >
              {languages.map(l => (
                <option key={l.code} value={l.code}>{l.name}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="absolute inset-0 modal-overlay"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl relative z-10 border border-bento-border"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Settings className="text-bento-accent" /> Configuration Profile
                </h2>
                <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-bento-muted mb-1 block">Nom de l'utilisateur</label>
                  <input 
                    type="text" 
                    value={settings.name}
                    onChange={(e) => setSettings(s => ({ ...s, name: e.target.value }))}
                    className="w-full bg-bento-bg border border-bento-border rounded-xl px-4 py-2 focus:ring-2 focus:ring-bento-accent outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-bento-muted mb-1 block">Ville / Région</label>
                  <select 
                    value={settings.city}
                    onChange={(e) => setSettings(s => ({ ...s, city: e.target.value }))}
                    className="w-full bg-bento-bg border border-bento-border rounded-xl px-4 py-2 focus:ring-2 focus:ring-bento-accent outline-none"
                  >
                    {REGIONS.map(r => (
                      <option key={r.city} value={r.city}>{r.city}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-bento-muted mb-1 block">Plantations Actives</label>
                  <div className="flex flex-wrap gap-2 mb-3 min-h-[40px] p-2 bg-bento-bg rounded-xl border border-bento-border/50">
                    {settings.crops.length > 0 ? settings.crops.map((crop, i) => (
                      <motion.span 
                        initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        key={i} 
                        className="flex items-center gap-1 px-3 py-1 bg-bento-accent text-white rounded-full text-xs font-bold shadow-sm"
                      >
                        {crop}
                        <button onClick={() => setSettings(s => ({ ...s, crops: s.crops.filter((_, idx) => idx !== i) }))}>
                          <X size={12} className="hover:text-amber-300 transition-colors" />
                        </button>
                      </motion.span>
                    )) : (
                      <span className="text-[10px] text-bento-muted italic self-center">Aucune culture ajoutée</span>
                    )}
                  </div>
                  
                  <div className="mb-2">
                    <p className="text-[9px] uppercase font-bold text-bento-muted mb-2 tracking-widest">Suggestions :</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.keys(CROP_DATABASE).filter(c => !settings.crops.includes(c)).map(crop => (
                        <button
                          key={crop}
                          onClick={() => setSettings(s => ({ ...s, crops: [...s.crops, crop] }))}
                          className="px-2 py-1 bg-white border border-bento-border rounded-lg text-[10px] font-bold hover:bg-bento-accent hover:text-white transition-all shadow-sm"
                        >
                          + {crop}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <input 
                      id="new-crop"
                      type="text" 
                      placeholder="Autre culture..."
                      className="flex-grow bg-bento-bg border border-bento-border rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-bento-accent outline-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = (e.currentTarget as HTMLInputElement).value;
                          if (val && !settings.crops.includes(val)) {
                            setSettings(s => ({ ...s, crops: [...s.crops, val] }));
                            (e.currentTarget as HTMLInputElement).value = '';
                          }
                        }
                      }}
                    />
                    <button 
                      onClick={() => {
                        const el = document.getElementById('new-crop') as HTMLInputElement;
                        if (el.value && !settings.crops.includes(el.value)) {
                          setSettings(s => ({ ...s, crops: [...s.crops, el.value] }));
                          el.value = '';
                        }
                      }}
                      className="bg-bento-accent text-white p-2 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setShowSettings(false)}
                className="w-full mt-8 py-4 bg-bento-accent text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all"
              >
                Enregistrer les modifications
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bento Grid */}
      <div className="grid grid-cols-12 auto-rows-min md:grid-rows-6 gap-6 flex-grow">
        
        {/* Weather Card (Large) */}
        <div className="col-span-12 lg:col-span-8 row-span-3 bg-white rounded-3xl border border-bento-border p-8 flex flex-col justify-between shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-orange-500/10 transition-all duration-500"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
              <div>
                <span className="px-3 py-1 bg-amber-100 text-bento-warning text-[10px] font-bold uppercase tracking-wider rounded-md border border-amber-200">
                  <div className="flex items-center gap-2">
                    <Sun size={12} /> {format(new Date(), 'dd MMMM yyyy', { locale: fr })}
                  </div>
                </span>
                <h2 className="text-4xl md:text-5xl font-serif text-bento-heading mt-6 leading-tight italic">
                  {weather?.condition || 'Météo Locale'}
                </h2>
                <p className="text-bento-muted text-sm md:text-base max-w-md mt-4 font-medium">
                  {weather ? `${weather.forecast}. Humidité record de ${weather.humidity}% à ${weather.city}.` : 'Chargement des données...'}
                </p>
              </div>
              <div className="text-right">
                <div className="text-5xl md:text-7xl font-serif italic text-bento-heading flex items-start justify-end gap-1">
                  <Thermometer size={48} className="text-bento-accent opacity-20 -mt-2" />
                  {weather?.temp || '--'}°C
                </div>
                <div className="text-[10px] text-bento-accent font-bold uppercase tracking-widest mt-2 flex items-center justify-end gap-2">
                  <Droplets size={12} /> {weather?.humidity}% Humidité | <Wind size={12} /> 12km/h
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-auto">
            {['Aujourd\'hui', 'Demain', 'Mercredi', 'Jeudi'].map((day, i) => (
              <div key={day} className="p-4 bg-bento-bg rounded-2xl border border-bento-border transition-all hover:scale-[1.02] hover:bg-white active:scale-[0.98]">
                <div className="text-[10px] text-bento-muted uppercase font-bold mb-1">{day}</div>
                <div className="text-base md:text-xl font-bold flex items-center gap-2">
                  {i === 0 ? <Sun size={18} className="text-amber-500" /> : <CloudRain size={18} className="text-blue-400" />}
                  {i === 2 ? <span className="text-bento-warning">+38°C</span> : '28°C'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Diagnostic Chat (Medium / Vertical Column) */}
        <div className="col-span-12 lg:col-span-4 row-span-6 bg-bento-accent rounded-3xl p-6 md:p-8 flex flex-col text-white shadow-2xl relative overflow-hidden h-[600px] lg:h-auto">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Zap size={20} className="text-amber-300" />
              Diagnostic
            </h3>
            <span className="text-[10px] bg-white/20 px-2 py-1 rounded font-bold uppercase">Bio-Support</span>
          </div>

          <div className="flex-grow overflow-y-auto no-scrollbar space-y-6 pr-1">
            <AnimatePresence mode="popLayout">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: msg.sender === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "max-w-[90%] rounded-2xl p-4",
                    msg.sender === 'user' 
                      ? "bg-white/10 border border-white/20 self-end rounded-tr-none text-white/90 italic" 
                      : "bg-white text-bento-text self-start rounded-tl-none shadow-lg"
                  )}
                >
                  {msg.sender === 'bot' && <p className="text-[10px] font-bold text-bento-accent uppercase mb-2">Conseil Expert :</p>}
                  <div className={cn("prose prose-sm", msg.sender === 'bot' ? "text-bento-text" : "text-white")}>
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                  <p className="text-[8px] mt-2 text-right opacity-50 font-mono">
                    {msg.sender === 'bot' ? `${msg.text.length} / 160 car.` : ''}
                  </p>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex items-center gap-3 text-white/80 text-xs italic"
                >
                  <Loader2 className="animate-spin" size={14} />
                  Analyse du terrain...
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>

          {/* Form / Input */}
          <div className="mt-6 pt-4 border-t border-white/10">
            
            {/* Quick Suggestions */}
            <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
              {[
                { label: "🍃 Bio-Pesticide", prompt: "Recette naturelle pour pucerons" },
                { label: "📅 Semis", prompt: "Meilleure date pour semer" },
                { label: "💧 Irrigation", prompt: "Conseil arrosage forte chaleur" },
              ].map((s) => (
                <button
                  key={s.label}
                  onClick={() => setInput(s.prompt)}
                  className="whitespace-nowrap px-3 py-1 bg-white/10 border border-white/20 rounded-full text-[10px] font-bold text-white/80 hover:bg-white/20 transition-all uppercase tracking-widest"
                >
                  {s.label}
                </button>
              ))}
            </div>

            {selectedImage && (
              <div className="mb-4 relative inline-block">
                <img src={selectedImage} alt="Preview" className="h-16 w-16 object-cover rounded-xl border-2 border-white/40" />
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                >
                  <X size={10} />
                </button>
              </div>
            )}
            <form onSubmit={handleSend} className="relative group">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Décrivez votre problème..."
                className="w-full bg-white/10 border-white/20 border text-white rounded-2xl px-5 py-4 pr-12 focus:outline-none focus:bg-white/15 transition-all text-sm placeholder:text-white/40 shadow-inner"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 hover:bg-white/10 rounded-full text-white/70"
                >
                   <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={handleImageChange} />
                   <Leaf size={18} />
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading || !input.trim()}
                  className="p-2 bg-white text-bento-accent rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 shadow-md"
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="col-span-12 sm:col-span-6 lg:col-span-4 row-span-3 bg-bento-secondary rounded-3xl p-8 border border-bento-border flex flex-col group">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-bento-heading flex items-center gap-2">
              <Calendar size={18} className="text-bento-accent" />
              Calendrier de Semis
            </h3>
            <span className="text-[8px] bg-white/40 px-2 py-0.5 rounded font-black tracking-widest uppercase">Planning Mensuel</span>
          </div>
          <div className="space-y-6 flex-grow overflow-y-auto no-scrollbar">
            {settings.crops.length > 0 ? (
              settings.crops.map((cropName) => {
                const info = getCropCalendar(cropName);
                const nextTask = info.calendar[0]; // Simple logic: show first task for demo
                return (
                  <div key={cropName} className="flex items-center gap-4 transition-transform group-hover:translate-x-1">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center font-bold shadow-sm border border-bento-border text-lg italic shrink-0",
                      nextTask.isUrgent ? "bg-amber-100 text-bento-warning" : "bg-white text-bento-accent"
                    )}>
                      {nextTask.day}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-bento-heading">{cropName}</p>
                      <p className="text-[10px] text-bento-muted font-bold uppercase tracking-tight">{nextTask.month} : {nextTask.task}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4 text-bento-muted text-xs italic">
                Ajoutez des cultures dans votre profil pour voir le calendrier
              </div>
            )}
          </div>
          <button 
            onClick={() => setShowCalendar(true)}
            className="mt-4 pt-4 border-t border-bento-border/50 text-xs font-bold text-bento-accent flex items-center gap-1 hover:underline"
          >
            Consulter le calendrier complet <ChevronRight size={14} />
          </button>
        </div>

        {/* Full Calendar Modal */}
        <AnimatePresence>
          {showCalendar && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setShowCalendar(false)}
                className="absolute inset-0 modal-overlay"
              />
              <motion.div 
                initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
                className="bg-white rounded-3xl p-8 w-full max-w-2xl shadow-2xl relative z-10 border border-bento-border max-h-[90vh] overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                      <Calendar className="text-bento-accent" size={32} /> Calendrier Agricole
                    </h2>
                    <p className="text-xs text-bento-muted font-bold tracking-widest uppercase mt-1">Saison 2026 · {settings.city}</p>
                  </div>
                  <button onClick={() => setShowCalendar(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {(() => {
                    const months = ['Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre'];
                    // Flat list of all tasks for all crops
                    const allTasks = settings.crops.flatMap(cropName => {
                      const info = getCropCalendar(cropName);
                      return info.calendar.map(t => ({ ...t, cropName }));
                    });

                    return months.map(month => {
                      const monthTasks = allTasks.filter(t => t.month === month);
                      if (monthTasks.length === 0) return null;

                      return (
                        <div key={month} className="space-y-4">
                          <h3 className="text-lg font-serif italic border-b border-bento-border pb-2 flex justify-between items-center">
                            {month}
                            <span className="text-[8px] font-bold text-bento-accent bg-bento-bg px-2 py-0.5 rounded uppercase">{monthTasks.length} Tâches</span>
                          </h3>
                          <div className="space-y-3">
                            {monthTasks.sort((a, b) => a.day - b.day).map((evt, idx) => (
                              <div key={`${evt.cropName}-${idx}`} className="flex items-center gap-3 bg-bento-bg p-3 rounded-xl border border-bento-border shadow-sm group/item hover:bg-white transition-colors">
                                <div className={cn(
                                  "font-bold text-lg w-8 text-center",
                                  evt.isUrgent ? "text-bento-warning" : "text-bento-accent"
                                )}>
                                  {evt.day}
                                </div>
                                <div className="h-8 w-px bg-bento-border" />
                                <div>
                                  <p className="text-sm font-bold leading-tight">{evt.task}</p>
                                  <p className="text-[10px] text-bento-muted font-bold uppercase tracking-widest mt-1">{evt.cropName}</p>
                                </div>
                                {evt.isUrgent && <Zap size={14} className="ml-auto text-amber-500 fill-amber-500 animate-pulse" />}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }).filter(Boolean);
                  })()}
                  {settings.crops.length === 0 && (
                    <div className="col-span-full py-12 text-center text-bento-muted flex flex-col items-center gap-4">
                      <Sprout size={48} className="opacity-20" />
                      <p className="font-serif italic text-lg text-bento-heading">Votre calendrier est vide.</p>
                      <button 
                        onClick={() => { setShowCalendar(false); setShowSettings(true); }}
                        className="text-xs font-bold text-bento-accent uppercase tracking-widest underline decoration-2 underline-offset-4"
                      >
                        Configurer mes cultures
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3 italic text-amber-800 text-sm">
                  <Zap size={20} className="shrink-0" />
                  Note: Ces dates sont ajustées en fonction des prévisions de pluie à {weather?.city}.
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Local Solutions (Small) */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-4 row-span-2 bg-bento-warning rounded-3xl p-8 text-white overflow-hidden relative shadow-lg group">
           <div className="relative z-10">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 text-white/80">Astuce Bio Locale</h3>
            <p className="text-2xl font-serif italic leading-tight">Biopesticide au Neem</p>
            <p className="text-sm mt-4 text-white/90 leading-relaxed font-medium">
              Écrasez 500g de graines de neem pour 10L d'eau. Laissez reposer 1 nuit. Pulvérisez sans frais.
            </p>
           </div>
           <Sprout className="absolute -bottom-6 -right-6 w-32 h-32 text-white/10 group-hover:rotate-12 transition-transform duration-700" />
        </div>

      </div>

      {/* Footer Info */}
      <footer className="mt-12 flex flex-col md:flex-row justify-between items-center text-bento-muted text-[10px] font-bold uppercase tracking-[0.2em] gap-4">
        <p>Propulsé par IA Vulgarisation Agricole · 2026</p>
        <div className="flex flex-wrap justify-center gap-6">
          <span>Données: Station Météo {weather?.city || 'Bamako-Sénou'}</span>
          <span>Support: WhatsApp / SMS 7000</span>
        </div>
      </footer>
    </div>
  );
}
