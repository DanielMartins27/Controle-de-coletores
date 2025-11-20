import React, { useState, useEffect } from 'react';
import { 
  Barcode, Search, RotateCcw, Download, Inbox, Smartphone, ChevronDown, 
  AlertTriangle, Clock, Plus, FileText, UserPlus, Trash2, Settings, 
  XCircle, AlertCircle, HardDrive, Database
} from 'lucide-react';

import { Collaborator, DeleteItem } from './types';
import { Modal } from './components/Modal';

// Dados iniciais (Seed)
const INITIAL_DATA_SEED = [
    { id: '1', numericId: 1, colaborador: "DANILO FRANCO", coletorPadrao: "02FRI" },
    { id: '2', numericId: 2, colaborador: "LUIZ HENRIQUE CORDEIRO", coletorPadrao: "57FRI" },
    { id: '3', numericId: 3, colaborador: "MARCIO BASTOS", coletorPadrao: "75FRI" },
    { id: '4', numericId: 4, colaborador: "LUIS FERNANDO", coletorPadrao: "18FRI" },
    { id: '5', numericId: 5, colaborador: "MATHEUS DE JESUS", coletorPadrao: "14FRI" },
    { id: '6', numericId: 6, colaborador: "THIAGO ROHLEDER", coletorPadrao: "25FRI" },
    { id: '7', numericId: 7, colaborador: "THIAGO PEREIRA", coletorPadrao: "31FRI" },
    { id: '8', numericId: 8, colaborador: "IVANILDO FOMBRI", coletorPadrao: "13FRI" },
    { id: '9', numericId: 9, colaborador: "WANDERSON DOS SANTOS", coletorPadrao: "24FRI" },
    { id: '10', numericId: 10, colaborador: "JHONATAN GONÇALVES", coletorPadrao: "16FRI" },
    { id: '11', numericId: 11, colaborador: "RENAN PAZITO", coletorPadrao: "88FRI" },
    { id: '12', numericId: 12, colaborador: "ALEXANDRE CARDOSO", coletorPadrao: "91FRI" },
    { id: '13', numericId: 13, colaborador: "LUCAS ARAUJO", coletorPadrao: "32FRI" },
    { id: '14', numericId: 14, colaborador: "DENILSON DANTAS", coletorPadrao: "12FRI" },
    { id: '15', numericId: 15, colaborador: "LUIZ WAGNER", coletorPadrao: "17FRI" },
    { id: '16', numericId: 16, colaborador: "HUDSON ADRIANO", coletorPadrao: "15FRI" },
    { id: '17', numericId: 17, colaborador: "ISAAC DIAS SOARES", coletorPadrao: "27FRI" },
    { id: '18', numericId: 18, colaborador: "VITOR CASTRO", coletorPadrao: "2324FRI" },
    { id: '19', numericId: 19, colaborador: "RODRIGO PRATES", coletorPadrao: "5024FRI" }
];

const INITIAL_COLLECTORS_SEED = [
    "02FRI", "57FRI", "75FRI", "18FRI", "14FRI", "25FRI", "31FRI", 
    "13FRI", "24FRI", "16FRI", "88FRI", "91FRI", "32FRI", "12FRI", 
    "17FRI", "15FRI", "27FRI", "2324FRI", "5024FRI"
].sort();

const STORAGE_KEYS = {
    COLLABORATORS: 'app_collaborators_v1',
    COLLECTORS: 'app_collectors_v1'
};

export default function App() {
    // Initialization from LocalStorage
    const [assignments, setAssignments] = useState<Collaborator[]>(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.COLLABORATORS);
        return saved ? JSON.parse(saved) : INITIAL_DATA_SEED;
    });

    const [collectors, setCollectors] = useState<string[]>(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.COLLECTORS);
        return saved ? JSON.parse(saved) : INITIAL_COLLECTORS_SEED;
    });

    const [currentTime, setCurrentTime] = useState(new Date());
    const [filterText, setFilterText] = useState("");
    const [showCollabModal, setShowCollabModal] = useState(false);
    const [showCollectorModal, setShowCollectorModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<DeleteItem | null>(null);
    const [newCollabName, setNewCollabName] = useState("");
    const [newCollectorCode, setNewCollectorCode] = useState("");

    // --- 1. Persistência Local ---
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.COLLABORATORS, JSON.stringify(assignments));
    }, [assignments]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.COLLECTORS, JSON.stringify(collectors));
    }, [collectors]);

    // --- 2. Bibliotecas PDF & Timer ---
    useEffect(() => {
        const loadScript = (src: string) => {
            return new Promise<void>((resolve, reject) => {
                if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
                const script = document.createElement('script');
                script.src = src;
                script.async = true;
                script.onload = () => resolve();
                script.onerror = reject;
                document.body.appendChild(script);
            });
        };
        const initPdfLibs = async () => {
            try {
                await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
                await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.29/jspdf.plugin.autotable.min.js");
            } catch (e) {
                console.error("PDF Libs load error", e);
            }
        };
        initPdfLibs();
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // --- CRUD Operações Locais ---

    const seedDatabase = () => {
        setAssignments(INITIAL_DATA_SEED);
        setCollectors(INITIAL_COLLECTORS_SEED);
    };

    const resetDatabase = () => {
        if (!window.confirm("ATENÇÃO: Isso excluirá TODOS os dados atuais e restaurará a lista original. Deseja continuar?")) return;
        seedDatabase();
    };

    const handleAddCollaborator = () => {
        if (!newCollabName.trim()) return;
        
        const newItem: Collaborator = {
            id: crypto.randomUUID(),
            colaborador: newCollabName.toUpperCase(),
            coletorPadrao: "",
            createdAt: new Date().toISOString()
        };

        setAssignments(prev => [...prev, newItem].sort((a, b) => a.colaborador.localeCompare(b.colaborador)));
        setNewCollabName("");
        setShowCollabModal(false);
    };

    const handleCollectorChange = (idStr: string, newCollector: string) => {
        setAssignments(prev => prev.map(item => 
            item.id === idStr ? { ...item, coletorPadrao: newCollector } : item
        ));
    };

    const handleClearCollector = (idStr: string) => handleCollectorChange(idStr, "");

    const handleAddCollector = () => {
        if (!newCollectorCode.trim()) return;
        const code = newCollectorCode.toUpperCase().trim();
        if (collectors.includes(code)) return;

        setCollectors(prev => [...prev, code].sort());
        setNewCollectorCode("");
    };

    const executeDelete = () => {
        if (!itemToDelete) return;

        if (itemToDelete.type === 'collaborator') {
            setAssignments(prev => prev.filter(item => item.id !== itemToDelete.id));
        } else if (itemToDelete.type === 'collector') {
            const code = itemToDelete.id;
            setCollectors(prev => prev.filter(c => c !== code));
            // Desvincular em massa
            setAssignments(prev => prev.map(a => 
                a.coletorPadrao === code ? { ...a, coletorPadrao: "" } : a
            ));
        }
        setItemToDelete(null);
    };

    // --- Utils ---
    const checkDuplicates = (collectorCode: string) => {
        if (!collectorCode) return false;
        return assignments.filter(a => a.coletorPadrao === collectorCode).length > 1;
    };

    const downloadCSV = () => {
        const dateStr = currentTime.toLocaleDateString('pt-BR');
        const timeStr = currentTime.toLocaleTimeString('pt-BR');
        let csv = "data:text/csv;charset=utf-8,RELATÓRIO DE CONTROLE DE COLETORES\n";
        csv += `Gerado em: ${dateStr} as ${timeStr}\n\nCOLABORADOR;COLETOR;STATUS\n`;
        assignments.forEach(i => csv += `${i.colaborador};${i.coletorPadrao || "NENHUM"};${i.coletorPadrao ? "Em Uso" : "Sem Coletor"}\n`);
        const link = document.createElement("a");
        link.href = encodeURI(csv);
        link.download = `Relatorio_${dateStr.replace(/\//g, '-')}.csv`;
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
    };

    const downloadPDF = () => {
        if (!window.jspdf) { alert("Carregando bibliotecas PDF..."); return; }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const dateStr = currentTime.toLocaleDateString('pt-BR');
        doc.text("Relatório de Controle de Coletores", 14, 22);
        doc.setFontSize(10); doc.text(`Gerado em: ${dateStr}`, 14, 28);
        const rows = assignments.map(i => [i.colaborador, i.coletorPadrao || "-", i.coletorPadrao ? "Ativo" : "Pendente"]);
        if ((doc as any).autoTable) {
            (doc as any).autoTable({ startY: 35, head: [["Colaborador", "Coletor", "Status"]], body: rows, theme: 'grid', headStyles: {fillColor:[30,58,138]} });
            doc.save(`Relatorio_${dateStr.replace(/\//g, '-')}.pdf`);
        }
    };

    const filteredAssignments = assignments.filter(item => 
        item.colaborador.toLowerCase().includes(filterText.toLowerCase()) ||
        (item.coletorPadrao && item.coletorPadrao.toLowerCase().includes(filterText.toLowerCase()))
    );

    const formattedDate = currentTime.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase();
    const formattedTime = currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="min-h-screen flex flex-col bg-[#f3f4f6] font-sans relative text-slate-800">
            {/* Header */}
            <header className="bg-blue-900 text-white shadow-lg sticky top-0 z-20 backdrop-blur-md bg-opacity-95 border-b border-blue-800/50">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/10 text-blue-200 p-2.5 rounded-xl backdrop-blur-sm shadow-inner border border-white/10">
                            <Barcode className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-lg md:text-xl font-bold tracking-tight leading-tight text-white">Controle de Coletores</h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="flex items-center gap-1.5 text-[10px] font-medium bg-blue-500/20 px-2.5 py-0.5 rounded-full text-blue-200 border border-blue-400/30 cursor-help" title="Armazenamento Local">
                                    <HardDrive className="w-3 h-3" /> Local Storage
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="hidden md:block text-right bg-blue-950/40 px-4 py-2 rounded-xl border border-blue-500/20 shadow-inner">
                        <p className="text-xl font-mono font-bold flex items-center justify-end gap-2 text-blue-100 tracking-wide">
                            <Clock className="w-4 h-4 text-blue-400" />{formattedTime}
                        </p>
                        <p className="text-[10px] text-blue-300 uppercase tracking-widest font-semibold">{formattedDate}</p>
                    </div>
                    <div className="md:hidden text-right">
                         <p className="font-mono font-bold text-blue-100">{formattedTime}</p>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow container mx-auto px-3 py-4 md:p-6 max-w-7xl">
                {/* Toolbar */}
                <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 sticky top-[80px] md:top-[92px] z-10 border border-slate-200/60 backdrop-blur-xl bg-opacity-90 transition-all duration-300">
                    <div className="flex flex-col xl:flex-row justify-between items-center gap-4">
                        <div className="relative w-full xl:w-96 group">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                            <input 
                                type="text" 
                                placeholder="Buscar colaborador ou código..." 
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white outline-none transition-all text-sm font-medium text-slate-700 placeholder:text-slate-400"
                                value={filterText} 
                                onChange={(e) => setFilterText(e.target.value)} 
                            />
                        </div>
                        
                        <div className="w-full xl:w-auto flex flex-wrap gap-2 justify-center xl:justify-end">
                            <div className="flex gap-2 w-full md:w-auto">
                                <button onClick={() => setShowCollabModal(true)} className="flex-1 md:flex-none px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center gap-2 text-sm font-semibold shadow-md shadow-blue-600/20 transition-all active:scale-95">
                                    <UserPlus className="w-4 h-4" /> <span className="hidden sm:inline">Novo Colaborador</span><span className="sm:hidden">Novo</span>
                                </button>
                                <button onClick={() => setShowCollectorModal(true)} className="flex-1 md:flex-none px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center gap-2 text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all active:scale-95">
                                    <Settings className="w-4 h-4" /> <span className="hidden sm:inline">Gerenciar Coletores</span><span className="sm:hidden">Coletores</span>
                                </button>
                            </div>
                            <div className="h-8 w-px bg-slate-200 hidden xl:block mx-2"></div>
                            <div className="flex gap-2 w-full md:w-auto">
                                <button onClick={downloadCSV} className="flex-1 md:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center gap-2 text-sm font-semibold shadow-md shadow-emerald-600/20 transition-all active:scale-95">
                                    <Download className="w-4 h-4" /> Excel
                                </button>
                                <button onClick={downloadPDF} className="flex-1 md:flex-none px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl flex items-center justify-center gap-2 text-sm font-semibold shadow-md shadow-rose-600/20 transition-all active:scale-95">
                                    <FileText className="w-4 h-4" /> PDF
                                </button>
                                <button onClick={resetDatabase} className="px-3 py-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors" title="Restaurar Padrão">
                                    <RotateCcw className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Data List */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200 mb-10">
                    <div className="hidden md:grid grid-cols-12 gap-4 bg-slate-50/80 p-4 border-b border-slate-200 font-semibold text-slate-500 uppercase text-xs tracking-wider backdrop-blur-sm">
                        <div className="col-span-1 text-center"># ID</div>
                        <div className="col-span-4">Colaborador</div>
                        <div className="col-span-4">Coletor Vinculado</div>
                        <div className="col-span-2 text-center">Status</div>
                        <div className="col-span-1 text-center">Ações</div>
                    </div>

                    {filteredAssignments.length === 0 ? (
                        <div className="p-20 text-center flex flex-col items-center justify-center min-h-[300px]">
                            <div className="flex flex-col items-center">
                                <div className="bg-slate-100 p-4 rounded-full mb-4"><Inbox className="w-10 h-10 text-slate-400" /></div>
                                <p className="text-slate-800 font-semibold text-lg">Nenhum registro encontrado</p>
                                <p className="text-slate-400 text-sm mt-1">Tente mudar o filtro de busca ou adicione um novo colaborador.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {filteredAssignments.map((item) => {
                                const isDuplicate = checkDuplicates(item.coletorPadrao);
                                return (
                                    <div key={item.id} className={`relative grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center transition-all duration-200 group ${isDuplicate ? 'bg-amber-50 hover:bg-amber-100/50' : 'hover:bg-blue-50/30'}`}>
                                        {/* Mobile ID */}
                                        <div className="absolute top-4 right-4 md:hidden text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">
                                            ID: {item.numericId || "#"}
                                        </div>

                                        {/* Desktop ID */}
                                        <div className="col-span-1 hidden md:block text-center font-mono text-slate-400 font-medium text-sm">
                                            {item.numericId ? String(item.numericId).padStart(2, '0') : "•"}
                                        </div>

                                        {/* Collaborator Info */}
                                        <div className="col-span-1 md:col-span-4 flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-sm shrink-0 border-2 ${isDuplicate ? 'bg-amber-200 text-amber-800 border-amber-300' : 'bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 border-white'}`}>
                                                {item.colaborador.charAt(0)}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <p className="font-bold text-slate-800 leading-tight truncate text-sm md:text-base">{item.colaborador}</p>
                                                <p className="text-xs text-slate-400 hidden md:block mt-0.5">Registrado no sistema</p>
                                            </div>
                                        </div>

                                        {/* Collector Selection */}
                                        <div className="col-span-1 md:col-span-4 mt-2 md:mt-0">
                                            <div className="relative flex items-center gap-2 max-w-xs md:max-w-full">
                                                <div className="relative w-full group/select">
                                                    <select 
                                                        value={item.coletorPadrao} 
                                                        onChange={(e) => handleCollectorChange(item.id, e.target.value)}
                                                        className={`w-full py-2.5 pl-10 pr-8 rounded-xl border appearance-none outline-none text-sm font-medium shadow-sm transition-all cursor-pointer
                                                            ${isDuplicate 
                                                                ? 'border-amber-400 bg-amber-100 text-amber-900 focus:ring-amber-400' 
                                                                : 'border-slate-200 bg-white text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                                                            }
                                                            ${!item.coletorPadrao && 'text-slate-400'}
                                                        `}
                                                    >
                                                        <option value="">Selecione um dispositivo...</option>
                                                        {collectors.map(c => <option key={c} value={c} className="text-slate-800">{c}</option>)}
                                                    </select>
                                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                        <Smartphone className={`w-4 h-4 transition-colors ${isDuplicate ? 'text-amber-700' : 'text-slate-400 group-focus-within/select:text-blue-500'}`} />
                                                    </div>
                                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                        <ChevronDown className="w-4 h-4 text-slate-400" />
                                                    </div>
                                                </div>
                                                
                                                {item.coletorPadrao && (
                                                    <button 
                                                        onClick={() => handleClearCollector(item.id)} 
                                                        className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 border border-slate-200 rounded-xl shadow-sm transition-all active:scale-95"
                                                        title="Desvincular"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                            {isDuplicate && (
                                                <div className="flex items-center gap-1.5 mt-2 text-amber-700 bg-amber-100/80 w-fit px-2 py-1 rounded-md animate-in slide-in-from-left-2 fade-in duration-300">
                                                    <AlertTriangle className="w-3 h-3" />
                                                    <span className="text-xs font-bold uppercase tracking-wide">Conflito Detectado</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Status */}
                                        <div className="col-span-1 md:col-span-2 flex items-center md:justify-center mt-2 md:mt-0">
                                            {item.coletorPadrao ? 
                                                <div className="flex flex-col items-start md:items-center">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 gap-2 border border-emerald-200 shadow-sm">
                                                        <span className="relative flex h-2 w-2">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                                        </span>
                                                        EM USO
                                                    </span>
                                                </div> : 
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-400 gap-2 border border-slate-200">
                                                    <span className="w-2 h-2 bg-slate-300 rounded-full"></span>
                                                    DISPONÍVEL
                                                </span>
                                            }
                                        </div>

                                        {/* Action */}
                                        <div className="col-span-1 flex justify-end md:justify-center mt-2 md:mt-0">
                                            <button 
                                                onClick={() => setItemToDelete({ type: 'collaborator', id: item.id })} 
                                                className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                title="Remover Colaborador"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="text-center text-slate-400 text-xs font-medium pb-8">
                    Sistema de Gestão v2.1 (Offline) • Total de Registros: {assignments.length}
                </div>
            </main>

            {/* Modals using reusable component */}
            <Modal 
                isOpen={showCollabModal} 
                onClose={() => setShowCollabModal(false)} 
                title={<><UserPlus className="w-5 h-5"/> Novo Colaborador</>}
                headerColorClass="bg-blue-800"
            >
                <label className="block text-sm font-bold text-slate-700 mb-2">Nome Completo</label>
                <div className="relative">
                    <input 
                        type="text" 
                        autoFocus 
                        className="w-full border border-slate-300 rounded-xl p-3 pl-4 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all uppercase placeholder:normal-case" 
                        placeholder="Ex: João da Silva" 
                        value={newCollabName} 
                        onChange={(e) => setNewCollabName(e.target.value)} 
                    />
                </div>
                <div className="mt-6 flex justify-end gap-2">
                    <button onClick={() => setShowCollabModal(false)} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors">Cancelar</button>
                    <button onClick={handleAddCollaborator} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/30 hover:bg-blue-700 active:scale-95 transition-all">Adicionar</button>
                </div>
            </Modal>

            <Modal 
                isOpen={showCollectorModal} 
                onClose={() => setShowCollectorModal(false)} 
                title={<><Settings className="w-5 h-5"/> Gerenciar Coletores</>}
                headerColorClass="bg-indigo-800"
            >
                <div className="mb-6 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                    <label className="block text-xs font-bold text-indigo-800 uppercase mb-2">Adicionar Novo</label>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            className="flex-grow border border-indigo-200 rounded-xl p-3 uppercase outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm" 
                            placeholder="CÓDIGO (EX: 99FRI)" 
                            value={newCollectorCode} 
                            onChange={(e) => setNewCollectorCode(e.target.value)} 
                        />
                        <button 
                            onClick={handleAddCollector} 
                            className="px-4 bg-indigo-600 text-white rounded-xl font-bold shadow-sm hover:bg-indigo-700 transition-colors"
                        >
                            <Plus className="w-5 h-5"/>
                        </button>
                    </div>
                </div>
                
                <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex justify-between">
                        <span>Lista Atual</span>
                        <span>{collectors.length} Unidades</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                        {collectors.map(c => (
                            <div key={c} className="group bg-white border border-slate-200 rounded-lg p-2.5 flex justify-between items-center shadow-sm hover:shadow-md hover:border-indigo-200 transition-all">
                                <span className="font-mono text-sm text-slate-700 font-medium flex items-center gap-2">
                                    <Smartphone className="w-3 h-3 text-slate-300" /> {c}
                                </span>
                                <button 
                                    onClick={() => setItemToDelete({ type: 'collector', id: c })} 
                                    className="text-slate-300 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-md transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </Modal>

            {/* Confirm Delete Dialog */}
            {itemToDelete && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200 border-t-4 border-red-500">
                        <div className="flex items-center gap-4 text-red-600 mb-4">
                            <div className="bg-red-100 p-3 rounded-full">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-xl text-slate-800">Confirmar Exclusão</h3>
                        </div>
                        <p className="text-slate-600 mb-8 text-sm leading-relaxed">
                            {itemToDelete.type === 'collaborator' 
                                ? "Tem certeza que deseja remover este colaborador da lista? O histórico será perdido." 
                                : `Tem certeza que deseja remover o coletor "${itemToDelete.id}"? Colaboradores vinculados ficarão sem dispositivo.`}
                        </p>
                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => setItemToDelete(null)} 
                                className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={executeDelete} 
                                className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-600/30 hover:bg-red-700 transition-all active:scale-95"
                            >
                                Sim, Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}