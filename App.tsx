
import React, { useState, useEffect, useRef } from 'react';
import { FoodItem, LunchboxSelection, ChatMessage, FoodCategory, DayOfWeek, WeeklyPlan, SavedLunchbox } from './types';
import { FOOD_ITEMS } from './constants';
import { getMadpakkeAdvice, generateLunchboxImage } from './services/geminiService';

const DAYS: DayOfWeek[] = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag'];

const App: React.FC = () => {
  const [step, setStep] = useState<number>(0);
  const [selection, setSelection] = useState<LunchboxSelection>({});
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingWeek, setIsGeneratingWeek] = useState(false);
  const [selectedDayDetail, setSelectedDayDetail] = useState<DayOfWeek | null>(null);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan>({
    'Mandag': null, 'Tirsdag': null, 'Onsdag': null, 'Torsdag': null, 'Fredag': null
  });
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  const categories: FoodCategory[] = ['base', 'protein', 'green', 'extra'];
  const categoryTitles = {
    base: 'TRIN 1: FUNDAMENTET! 🥖',
    protein: 'TRIN 2: SUPERKRÆFTER! 🥚',
    green: 'TRIN 3: VITAMIN-BOMBEN! 🥦',
    extra: 'TRIN 4: HEMMELIGT VÅBEN! 🎁'
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSelectItem = (item: FoodItem) => {
    setSelection(prev => ({ ...prev, [item.category]: item }));
    if (step < categories.length - 1) {
      setStep(step + 1);
    } else {
      setStep(4);
      triggerMagicFinalize();
    }
  };

  const triggerMagicFinalize = async () => {
    setIsTyping(true);
    setIsGeneratingImage(true);
    
    const [advice, imageUrl] = await Promise.all([
      getMadpakkeAdvice([], selection),
      generateLunchboxImage(selection)
    ]);
    
    setChatHistory([{ role: 'model', text: advice }]);
    setGeneratedImage(imageUrl);
    setIsTyping(false);
    setIsGeneratingImage(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = { role: 'user', text: inputText };
    setChatHistory(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    const response = await getMadpakkeAdvice([...chatHistory, userMsg], selection);
    setChatHistory(prev => [...prev, { role: 'model', text: response }]);
    setIsTyping(false);
  };

  const saveToWeek = (day: DayOfWeek) => {
    setWeeklyPlan(prev => ({ 
      ...prev, 
      [day]: { 
        selection: { ...selection },
        imageUrl: generatedImage
      } 
    }));
    resetGame();
  };

  const removeFromWeek = (day: DayOfWeek) => {
    setWeeklyPlan(prev => ({ ...prev, [day]: null }));
    if (selectedDayDetail === day) setSelectedDayDetail(null);
  };

  const resetGame = () => {
    setStep(0);
    setSelection({});
    setChatHistory([]);
    setGeneratedImage(null);
  };

  const calculateTotal = (sel: LunchboxSelection) => {
    return (sel.base?.price || 0) + 
           (sel.protein?.price || 0) + 
           (sel.green?.price || 0) + 
           (sel.extra?.price || 0);
  };

  const handleMagicPlan = async () => {
    setIsGeneratingWeek(true);
    const newPlan: WeeklyPlan = { ...weeklyPlan };
    
    // Generate all 5 days in parallel with unique images
    const proms = DAYS.map(async (day) => {
      const randomBase = FOOD_ITEMS.filter(i => i.category === 'base')[Math.floor(Math.random() * 4)];
      const randomProtein = FOOD_ITEMS.filter(i => i.category === 'protein')[Math.floor(Math.random() * 4)];
      const randomGreen = FOOD_ITEMS.filter(i => i.category === 'green')[Math.floor(Math.random() * 4)];
      const randomExtra = FOOD_ITEMS.filter(i => i.category === 'extra')[Math.floor(Math.random() * 4)];

      const sel = {
        base: randomBase,
        protein: randomProtein,
        green: randomGreen,
        extra: randomExtra
      };

      const imageUrl = await generateLunchboxImage(sel);
      return { day, sel, imageUrl };
    });

    const results = await Promise.all(proms);
    results.forEach(res => {
      newPlan[res.day] = { selection: res.sel, imageUrl: res.imageUrl };
    });

    setWeeklyPlan(newPlan);
    setIsGeneratingWeek(false);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = `
      <html>
        <head>
          <title>Ugens Madpakke-Plan</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Fredoka', sans-serif; padding: 20px; background: white; }
            @page { size: A4 portrait; margin: 10mm; }
            .comic-border { border: 4px solid black; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="border-[8px] border-black p-6 h-full flex flex-col bg-white">
            <header class="text-center mb-6 border-b-8 border-black pb-4">
              <h1 class="text-6xl font-black italic uppercase text-pink-600">UGENS MADPAKKE-PLAN</h1>
              <p class="font-black text-xl uppercase italic">Gør din krop uovervindelig!</p>
            </header>
            <div class="grid grid-cols-1 gap-4 flex-grow">
              ${DAYS.map(day => {
                const plan = weeklyPlan[day];
                if (!plan) return `<div class="border-4 border-black border-dashed p-4 text-center text-gray-400 italic font-black uppercase">${day}: IKKE PLANLAGT</div>`;
                return `
                  <div class="border-4 border-black p-3 flex gap-4 items-center bg-white relative">
                    <div class="absolute top-0 right-0 bg-yellow-400 border-l-4 border-b-4 border-black px-4 font-black italic uppercase text-sm">${day}</div>
                    <div class="w-32 h-32 border-2 border-black overflow-hidden flex-shrink-0">
                      ${plan.imageUrl ? `<img src="${plan.imageUrl}" class="w-full h-full object-cover" />` : `<div class="w-full h-full bg-gray-100 flex items-center justify-center text-4xl">🥪</div>`}
                    </div>
                    <div class="flex-grow grid grid-cols-2 gap-2">
                      <div class="font-black text-lg">${plan.selection.base?.emoji} ${plan.selection.base?.name}</div>
                      <div class="font-black text-lg">${plan.selection.protein?.emoji} ${plan.selection.protein?.name}</div>
                      <div class="font-black text-lg">${plan.selection.green?.emoji} ${plan.selection.green?.name}</div>
                      <div class="font-black text-lg">${plan.selection.extra?.emoji} ${plan.selection.extra?.name}</div>
                    </div>
                    <div class="text-right font-black italic border-l-2 border-black pl-4">
                      ${calculateTotal(plan.selection).toFixed(2)} kr
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
            <footer class="mt-6 flex justify-between items-center border-t-4 border-black pt-4">
               <div class="text-4xl">🧙‍♂️</div>
               <p class="font-black uppercase italic text-sm">Spis som en superhelt! BAM! POW! WOW!</p>
               <div class="text-xs font-black opacity-30 italic uppercase">Madpakke-Magikeren AI</div>
            </footer>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
  };

  const detailBox = selectedDayDetail ? weeklyPlan[selectedDayDetail] : null;

  return (
    <div className="min-h-screen flex flex-col items-center p-4 max-w-5xl mx-auto bg-yellow-50 pb-20 overflow-x-hidden">
      
      {/* LOADING OVERLAY FOR MAGIC PLAN */}
      {isGeneratingWeek && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex flex-col items-center justify-center text-white p-6 text-center">
          <div className="w-24 h-24 border-8 border-yellow-400 border-t-pink-500 rounded-full animate-spin mb-8"></div>
          <h2 className="text-4xl font-black italic uppercase mb-4 animate-bounce">Magikeren brygger ugeplanen... 🧙‍♂️✨</h2>
          <p className="text-xl font-bold uppercase tracking-widest text-yellow-400">Genererer 5 unikke mesterværker til din uge!</p>
          <div className="mt-8 bg-white text-black px-6 py-2 border-4 border-black rotate-3 font-black uppercase italic">
            Vent venligst på magien!
          </div>
        </div>
      )}

      <header className="text-center mb-6 relative w-full">
        <div className="absolute -top-4 left-0 bg-yellow-400 border-4 border-black px-4 py-1 -rotate-12 font-black text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase z-10">
          KAPOW!
        </div>
        <h1 className="text-5xl font-black text-pink-600 drop-shadow-sm mb-2 uppercase tracking-tighter italic">
          Madpakke <span className="text-black">Magikeren</span>
        </h1>
        <p className="text-gray-700 font-bold uppercase tracking-widest text-sm">Gør din krop uovervindelig! ⚡</p>
      </header>

      {/* Detail Overlay for Weekly Mission */}
      {selectedDayDetail && detailBox && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border-8 border-black w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-[16px_16px_0px_0px_rgba(255,100,200,1)] relative">
            <button 
              onClick={() => setSelectedDayDetail(null)}
              className="absolute top-4 right-4 bg-red-500 text-white border-4 border-black font-black p-2 hover:bg-red-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-10"
            >
              LUK X
            </button>

            <h2 className="text-4xl font-black italic uppercase mb-8 border-b-4 border-black pb-2">
              MISSION {selectedDayDetail.toUpperCase()}! 🚀
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden h-fit bg-gray-100">
                {detailBox.imageUrl ? (
                  <img src={detailBox.imageUrl} alt="Madpakke" className="w-full aspect-square object-cover" />
                ) : (
                  <div className="aspect-square flex items-center justify-center text-4xl">🖼️</div>
                )}
                <div className="bg-yellow-400 p-2 border-t-4 border-black text-center font-black uppercase text-xs italic">
                  DEN ULTIMATIVE FROKOST!
                </div>
              </div>

              <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative rotate-1">
                <div className="absolute -top-4 -right-4 bg-red-500 text-white px-3 py-1 border-2 border-black font-black uppercase text-xs -rotate-12">
                  HUSK!
                </div>
                <h3 className="text-2xl font-black italic border-b-2 border-black mb-4 uppercase">Dosmerseddel 📝</h3>
                
                <ul className="space-y-3 mb-6">
                  {Object.values(detailBox.selection).filter(Boolean).map((item: FoodItem) => (
                    <li key={item.id} className="flex justify-between items-center border-b border-dashed border-gray-300 pb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-black" />
                        <span className="font-bold text-gray-800">{item.emoji} {item.name}</span>
                      </div>
                      <span className="font-black text-pink-600 italic">{item.price.toFixed(2)} kr</span>
                    </li>
                  ))}
                </ul>

                <div className="border-t-4 border-black pt-2 flex justify-between items-center">
                  <span className="text-xl font-black uppercase italic">I ALT:</span>
                  <div className="bg-yellow-400 px-4 py-1 border-2 border-black font-black text-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    {calculateTotal(detailBox.selection).toFixed(2)} kr
                  </div>
                </div>
                
                <div className="mt-6 flex justify-center">
                  <button 
                    onClick={() => removeFromWeek(selectedDayDetail)}
                    className="text-xs font-black text-red-500 uppercase hover:underline"
                  >
                    Slet denne dag
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start">
        
        {/* Left Side: Builder or Result */}
        <div className="lg:col-span-6 space-y-6">
          {step < 4 ? (
            <div className="w-full bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-sm p-6 overflow-hidden min-h-[500px]">
              <div className="flex justify-between mb-6 border-b-4 border-black pb-2">
                {categories.map((cat, idx) => (
                  <div 
                    key={cat} 
                    className={`flex-grow h-4 border-2 border-black mx-1 transition-all duration-300 ${idx <= step ? 'bg-yellow-400' : 'bg-gray-100'}`}
                  />
                ))}
              </div>

              <h2 className="text-2xl font-black text-black mb-6 text-center italic uppercase">
                {categoryTitles[categories[step] as keyof typeof categoryTitles]}
              </h2>

              <div className="grid grid-cols-2 gap-4">
                {FOOD_ITEMS.filter(item => item.category === categories[step]).map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectItem(item)}
                    className={`${item.color} p-4 border-4 border-black rounded-sm flex flex-col items-center hover:bg-yellow-200 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none group`}
                  >
                    <span className="text-5xl mb-2 drop-shadow-md group-hover:scale-110 transition-transform">{item.emoji}</span>
                    <span className="font-black text-black uppercase text-base">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-left duration-500">
              <div className="bg-white border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
                <div className="absolute top-0 left-0 bg-black text-white px-6 py-2 font-black italic uppercase z-10 text-xl -skew-x-12 -translate-x-2">
                  DAGENS MESTERVÆRK!
                </div>
                
                <div className="aspect-square bg-gray-200 flex items-center justify-center relative">
                  {isGeneratingImage ? (
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-16 h-16 border-8 border-black border-t-pink-500 rounded-full animate-spin"></div>
                      <span className="font-black uppercase italic animate-pulse text-xl">Fremkalder foto...</span>
                    </div>
                  ) : generatedImage ? (
                    <img src={generatedImage} alt="Genereret madpakke" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-8">
                      <span className="text-4xl">📸</span>
                      <p className="font-black uppercase italic mt-2 text-gray-400">Kunne ikke tage billedet</p>
                    </div>
                  )}
                </div>

                <div className="bg-white border-t-4 border-black p-4">
                  <p className="font-black italic uppercase text-sm text-center">
                    {selection.base?.emoji} {selection.protein?.emoji} {selection.green?.emoji} {selection.extra?.emoji} = REN KRAFT!
                  </p>
                </div>
              </div>

              <div className="bg-pink-100 border-4 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-xl font-black uppercase italic mb-4 text-center">GEM TIL DIN UGEPLAN! 📅</h3>
                <div className="grid grid-cols-5 gap-2">
                  {DAYS.map(day => (
                    <button
                      key={day}
                      onClick={() => saveToWeek(day)}
                      className="bg-white border-2 border-black p-2 font-black text-xs uppercase hover:bg-yellow-400 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1"
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Educational Comic Chat */}
        <div className="lg:col-span-6 flex flex-col h-full">
          <div className="bg-blue-100 border-4 border-black p-4 shadow-[8px_8px_0px_0px_rgba(255,100,200,1)] min-h-[500px] flex flex-col relative overflow-hidden rounded-sm">
            <div className="bg-black text-white px-3 py-1 font-black uppercase italic inline-block w-fit mb-4 -skew-x-12">
              MAGIKERENS ANALYSE 🔮
            </div>
            
            <div className="flex-grow overflow-y-auto space-y-4 p-2 mb-4 custom-scrollbar max-h-[420px]">
              {chatHistory.length === 0 && !isTyping && (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
                  <span className="text-6xl mb-4">🧙‍♂️</span>
                  <p className="font-black uppercase italic">Vælg dine ingredienser for at se deres magiske kræfter!</p>
                </div>
              )}
              
              {chatHistory.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-white border-2 border-black flex items-center justify-center text-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    {msg.role === 'user' ? '🧒' : '🧙‍♂️'}
                  </div>
                  
                  <div className={`relative max-w-[85%] p-3 border-4 border-black font-black italic text-sm leading-tight ${
                    msg.role === 'user' 
                      ? 'bg-yellow-100 rounded-sm rounded-tr-none text-black' 
                      : 'bg-white rounded-sm rounded-tl-none text-black'
                  }`}>
                    {/* Speech bubble tail */}
                    <div className={`absolute top-0 w-0 h-0 border-t-[8px] border-t-black ${
                      msg.role === 'user' 
                        ? 'right-[-12px] border-r-[8px] border-r-transparent' 
                        : 'left-[-12px] border-l-[8px] border-l-transparent'
                    }`} />
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-white border-2 border-black flex items-center justify-center text-xl animate-bounce">⚡</div>
                  <div className="bg-white border-2 border-black p-2 font-black uppercase italic text-xs animate-pulse">
                    Magikeren studerer næringen...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="mt-auto flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Spørg om maden..."
                className="flex-grow p-3 border-4 border-black font-black uppercase placeholder-gray-400 focus:outline-none focus:bg-white bg-gray-50 text-black text-sm shadow-[inset_4px_4px_0px_0px_rgba(0,0,0,0.1)]"
              />
              <button 
                type="submit"
                className="bg-yellow-400 px-4 py-3 border-4 border-black hover:bg-yellow-500 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
              >
                <span className="font-black italic uppercase text-sm">GO!</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Weekly Headquarters Section */}
      <div className="w-full mt-12 bg-white border-4 border-black p-6 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-4 flex-grow">
            <div className="h-1 flex-grow bg-black"></div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter whitespace-nowrap">Ugens Missioner 🛸</h2>
            <div className="h-1 flex-grow bg-black"></div>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={handleMagicPlan}
              className="bg-purple-500 border-4 border-black px-6 py-2 font-black uppercase italic text-white hover:bg-purple-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center gap-2"
            >
              MAGISK PLAN 🪄
            </button>
            <button 
              onClick={handlePrint}
              className="bg-green-400 border-4 border-black px-6 py-2 font-black uppercase italic hover:bg-green-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center gap-2"
            >
              PRINT UGEPLAN 🖨️
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {DAYS.map(day => (
            <div 
              key={day} 
              onClick={() => weeklyPlan[day] && setSelectedDayDetail(day)}
              className={`border-4 border-black p-3 flex flex-col items-center min-h-[120px] relative group transition-all duration-200 ${
                weeklyPlan[day] 
                  ? 'bg-yellow-50 cursor-pointer hover:-translate-y-2 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]' 
                  : 'bg-gray-50'
              }`}
            >
              <span className="font-black uppercase text-sm mb-2 italic border-b-2 border-black w-full text-center">{day}</span>
              
              {weeklyPlan[day] ? (
                <div className="flex flex-col items-center justify-center flex-grow space-y-2">
                  <div className="w-full h-16 border-2 border-black overflow-hidden mb-1">
                    {weeklyPlan[day]?.imageUrl ? (
                      <img src={weeklyPlan[day]?.imageUrl || ''} class="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-wrap justify-center gap-1 text-xl items-center h-full">
                        <span>{weeklyPlan[day]?.selection.base?.emoji}</span>
                        <span>{weeklyPlan[day]?.selection.protein?.emoji}</span>
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromWeek(day);
                    }}
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white text-[10px] p-1 border border-black leading-none font-black"
                  >
                    X
                  </button>
                </div>
              ) : (
                <div className="flex-grow flex items-center justify-center opacity-20 italic font-bold text-xs uppercase">
                  Tom Panel
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <footer className="mt-8 text-center text-black font-black uppercase tracking-tighter">
        <div className="bg-black text-white px-4 py-1 rotate-1 inline-block shadow-[4px_4px_0px_0px_rgba(255,100,200,1)]">
          Sund krop, stærkt sind! 🧠💪
        </div>
      </footer>
    </div>
  );
};

export default App;
