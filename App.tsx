
import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  BarChart3, 
  Database, 
  TrendingUp, 
  Users, 
  Settings, 
  MessageSquare, 
  Mail, 
  Phone, 
  CheckCircle2,
  ArrowRight,
  Zap,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Target,
  Layers,
  Eye,
  Wallet
} from 'lucide-react';
import { ServiceItem, PortfolioReport } from './types';

// --- Sub-Components ---

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      window.scrollTo({
        top: element.getBoundingClientRect().top + window.pageYOffset - offset,
        behavior: 'smooth'
      });
      setIsOpen(false);
    }
  };

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-slate-950/95 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection('home')}>
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold font-montserrat tracking-tight text-white uppercase">INCREMENTAL<span className="text-blue-500 font-light">CONSULTORIA</span></span>
        </div>

        <nav className="hidden lg:flex items-center gap-8">
          {['Início', 'Especialista', 'Serviços', 'Dashboards', 'Contato'].map((name) => (
            <button 
              key={name} 
              onClick={() => scrollToSection(name === 'Dashboards' ? 'portfolio' : name === 'Início' ? 'home' : name === 'Especialista' ? 'about' : name.toLowerCase())}
              className="text-xs font-semibold text-slate-400 hover:text-blue-400 transition-colors uppercase tracking-widest"
            >
              {name}
            </button>
          ))}
          <a 
            href="https://wa.me/5511976956510"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg hover:shadow-blue-500/30 flex items-center gap-2"
          >
            Falar com o Bruno
          </a>
        </nav>

        <button className="lg:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      <div className={`lg:hidden fixed inset-0 bg-slate-950 z-40 flex flex-col items-center justify-center gap-8 transition-transform duration-500 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {['Início', 'Especialista', 'Serviços', 'Dashboards', 'Contato'].map((name) => (
          <button 
            key={name} 
            onClick={() => scrollToSection(name === 'Dashboards' ? 'portfolio' : name === 'Início' ? 'home' : name === 'Especialista' ? 'about' : name.toLowerCase())} 
            className="text-2xl font-bold text-slate-200 uppercase tracking-widest"
          >
            {name}
          </button>
        ))}
        <a href="https://wa.me/5511976956510" target="_blank" rel="noopener noreferrer" className="bg-blue-600 px-8 py-4 rounded-full text-lg font-bold text-white">Falar com o Bruno</a>
      </div>
    </header>
  );
};

const Hero = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden pt-20">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-600/10 to-transparent z-0"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]"></div>

      <div className="max-w-7xl mx-auto px-4 z-10 grid lg:grid-cols-2 gap-12 items-center">
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
            <Zap size={14} /> Power BI • DAX • Business Intelligence
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold font-montserrat leading-tight mb-6 text-white uppercase">
            Transformando <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Dados em Lucro</span> Real
          </h1>
          <p className="text-lg text-slate-400 mb-8 max-w-lg leading-relaxed">
            Especialista Bruno Sacramento: Consultoria focada na humanização de números e gestão estratégica de resultados. Dashboards inteligentes para quem decide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={() => document.getElementById('portfolio')?.scrollIntoView({behavior: 'smooth'})} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-600/20">
              Ver Dashboards <Eye size={20} />
            </button>
            <a href="https://wa.me/5511976956510" target="_blank" rel="noopener noreferrer" className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border border-slate-700">
              WhatsApp Direto <Phone size={20} />
            </a>
          </div>
        </div>

        <div className="hidden lg:block relative">
          <div className="glass-card p-6 rounded-[2.5rem] border-white/10 bg-slate-900/40 relative overflow-hidden shadow-2xl animate-float">
             <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center">
                   <div className="flex gap-2">
                      <div className="h-8 w-8 bg-blue-600 rounded flex items-center justify-center"><BarChart3 size={16} /></div>
                      <div className="h-8 w-24 bg-slate-800 rounded"></div>
                   </div>
                   <div className="h-8 w-8 bg-slate-800 rounded-full"></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                   <div className="h-24 bg-slate-800/50 rounded-2xl border border-white/5 p-4">
                      <div className="h-2 w-12 bg-blue-500/30 rounded mb-2"></div>
                      <div className="h-6 w-16 bg-white/10 rounded"></div>
                   </div>
                   <div className="h-24 bg-slate-800/50 rounded-2xl border border-white/5 p-4">
                      <div className="h-2 w-12 bg-emerald-500/30 rounded mb-2"></div>
                      <div className="h-6 w-16 bg-white/10 rounded"></div>
                   </div>
                   <div className="h-24 bg-slate-800/50 rounded-2xl border border-white/5 p-4">
                      <div className="h-2 w-12 bg-red-500/30 rounded mb-2"></div>
                      <div className="h-6 w-16 bg-white/10 rounded"></div>
                   </div>
                </div>
                <div className="h-48 bg-slate-800/30 rounded-2xl border border-white/5 flex items-center justify-center">
                   <TrendingUp size={48} className="text-blue-500/20" />
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Portfolio = () => {
  const reports: PortfolioReport[] = [
    {
      title: "Análise de Vendas & PVM",
      subtitle: "Gestão Gerencial de Resultados",
      image: "./vendas.png",
      objective: "Visão detalhada de faturamento, preço médio e PVM (Preço, Volume e Mix) para entender o que realmente move o caixa.",
      kpis: ["Faturamento Mensal", "Preço Médio", "Impacto Mix", "Não Vendas"],
      impact: "Identificação precisa de variações de margem e faturamento por produto/segmento.",
      tags: ["Vendas", "PVM", "Comercial"]
    },
    {
      title: "Indicadores de Estoque",
      subtitle: "Prevenção de Ruptura e Giro",
      image: "./estoque.png",
      objective: "Monitoramento de produtos críticos: Estoque Zero, Ruptura de Risco e Margem Negativa.",
      kpis: ["Estoque Zero", "Ruptura (Risco)", "MG Negativa", "Ação Recomendada"],
      impact: "Redução de capital imobilizado e otimização imediata das compras e pedidos.",
      tags: ["Estoque", "Giro", "Operacional"]
    },
    {
      title: "Análise de Rotatividade",
      subtitle: "Giro de Produtos e Comportamento",
      image: "./rotatividade.png",
      objective: "Análise de frequência de compra e giro por departamento para otimização do mix de produtos.",
      kpis: ["Giro por Grupo", "Clientes Ativos", "Status de Giro", "Heatmap"],
      impact: "Decisões baseadas no comportamento real do consumidor final na loja.",
      tags: ["Rotatividade", "Mix", "Varejo"]
    },
    {
      title: "Análise de Despesas",
      subtitle: "Controle Orçamentário e DRE",
      image: "./despesas.png",
      objective: "Comparativo entre Orçado vs Real para garantir o cumprimento das metas financeiras.",
      kpis: ["Orçado vs Atual", "% Part Despesas", "Gastos Gerenciais", "Desvio %"],
      impact: "Visibilidade total dos custos fixos e variáveis com foco na preservação da margem líquida.",
      tags: ["Despesas", "Orçamento", "DRE"]
    }
  ];

  return (
    <section id="portfolio" className="py-24 bg-slate-900/30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className="text-blue-500 font-bold uppercase tracking-[0.3em] text-[10px] mb-4">Portfólio de Dashboards</h2>
          <h3 className="text-4xl font-bold font-montserrat text-white uppercase tracking-tight">Inteligência que Gera Caixa</h3>
        </div>

        <div className="grid gap-24">
          {reports.map((report, index) => (
            <div key={index} className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 items-center group`}>
              {/* Moldura do Dashboard com suporte a erro de carregamento */}
              <div className="w-full lg:w-3/5 relative group cursor-pointer overflow-hidden rounded-[2.5rem] border border-white/10 shadow-2xl bg-[#0b0f1a] aspect-video">
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <img 
                  src={report.image} 
                  alt={report.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 relative z-10"
                  onLoad={(e) => {
                    e.currentTarget.classList.add('opacity-100');
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      const placeholder = document.createElement('div');
                      placeholder.className = "w-full h-full flex flex-col items-center justify-center p-8 text-center bg-slate-900/80 absolute inset-0";
                      placeholder.innerHTML = `
                        <div class="mb-4 text-blue-500 opacity-20"><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="21" y2="9"/></svg></div>
                        <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">${report.title}</p>
                        <p class="text-[9px] text-slate-600 font-medium">Verifique se "${report.image.replace('./', '')}" está na raiz do projeto.</p>
                      `;
                      parent.appendChild(placeholder);
                    }
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent pointer-events-none z-20"></div>
              </div>

              {/* Informações Estratégicas */}
              <div className="w-full lg:w-2/5 space-y-6">
                <div>
                  <p className="text-blue-500 font-bold uppercase text-[10px] tracking-[0.3em] mb-2">{report.subtitle}</p>
                  <h4 className="text-3xl font-bold text-white font-montserrat tracking-tight uppercase group-hover:text-blue-400 transition-colors">{report.title}</h4>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Target className="text-blue-500 shrink-0 mt-1" size={20} />
                    <p className="text-slate-400 text-sm leading-relaxed"><strong className="text-white">Objetivo:</strong> {report.objective}</p>
                  </div>
                  <div className="flex gap-4">
                    <Layers className="text-emerald-500 shrink-0 mt-1" size={20} />
                    <div>
                       <p className="text-white font-bold text-sm mb-2 uppercase tracking-wider">KPIs Analisados</p>
                       <div className="flex flex-wrap gap-2">
                          {report.kpis.map(kpi => <span key={kpi} className="text-[10px] font-bold text-slate-300 bg-slate-800 px-3 py-1 rounded-md border border-white/5">{kpi}</span>)}
                       </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <TrendingUp className="text-orange-500 shrink-0 mt-1" size={20} />
                    <p className="text-slate-400 text-sm italic font-medium">"{report.impact}"</p>
                  </div>
                </div>
                <div className="pt-4">
                  <a href="https://wa.me/5511976956510" target="_blank" rel="noopener noreferrer" className="bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border border-blue-500/20 inline-flex items-center gap-3">
                    Agendar Demonstração <ArrowRight size={14} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const About = () => {
  return (
    <section id="about" className="py-24 bg-slate-900/30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
             <div className="glass-card p-10 rounded-[2.5rem] border-blue-500/20 bg-blue-600/5 relative z-10">
                <h4 className="text-2xl font-bold text-white mb-6 uppercase tracking-tight">Bruno Sacramento</h4>
                <p className="text-slate-400 mb-8 leading-relaxed text-lg">
                  Consultor especializado em estruturação de dados e BI. Com uma trajetória de mais de 20 anos, transformo números brutos em decisões que geram caixa e sustentabilidade financeira.
                </p>
                <div className="space-y-4">
                   <div className="flex items-center gap-4 group">
                      <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <CheckCircle2 size={18} />
                      </div>
                      <span className="text-slate-200 font-medium">Especialista em Power BI & DAX</span>
                   </div>
                   <div className="flex items-center gap-4 group">
                      <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <CheckCircle2 size={18} />
                      </div>
                      <span className="text-slate-200 font-medium">Análise Financeira Avançada</span>
                   </div>
                   <div className="flex items-center gap-4 group">
                      <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <CheckCircle2 size={18} />
                      </div>
                      <span className="text-slate-200 font-medium">Integração SQL, APIs e Python</span>
                   </div>
                </div>
             </div>
             <div className="absolute -bottom-10 -right-10 h-64 w-64 bg-blue-600 rounded-full blur-[120px] opacity-10"></div>
          </div>

          <div className="space-y-8">
            <h2 className="text-blue-500 font-bold uppercase tracking-[0.4em] text-[10px]">A Incremental</h2>
            <h3 className="text-4xl lg:text-5xl font-extrabold font-montserrat text-white uppercase leading-tight">Gestão Estratégica <br />de Resultados</h3>
            <p className="text-slate-400 text-lg leading-relaxed">
              Fugimos do "gráfico pelo gráfico". Nossa consultoria é consultiva e focada no dono do negócio. Implementamos a cultura de dados para que você entenda exatamente onde está ganhando ou perdendo margem.
            </p>
            <div className="pt-4 flex items-center gap-8">
               <div>
                  <p className="text-3xl font-black text-white">20+</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Anos de Know-how</p>
               </div>
               <div className="h-10 w-px bg-slate-800"></div>
               <div>
                  <p className="text-3xl font-black text-white">100%</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Foco no Cliente</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Services = () => {
  const services: ServiceItem[] = [
    { icon: <BarChart3 className="w-8 h-8" />, title: "BI Comercial", desc: "Análise PVM e Mix de produtos para potencializar o faturamento bruto.", color: "blue" },
    { icon: <Database className="w-8 h-8" />, title: "Gestão de Estoque", desc: "Controle de ruptura, estoque zero e excessos para otimização de caixa.", color: "indigo" },
    { icon: <Wallet className="w-8 h-8" />, title: "BI Financeiro", desc: "DRE, Fluxo de Caixa e Controle Orçamentário com visões gerenciais.", color: "green" },
    { icon: <Users className="w-8 h-8" />, title: "Mentoria Técnica", desc: "Capacitação em Power BI e modelagem DAX para analistas internos.", color: "purple" },
    { icon: <Settings className="w-8 h-8" />, title: "ETL & Automação", desc: "Tratamento de dados complexos via Python e SQL para relatórios ágeis.", color: "orange" },
    { icon: <Briefcase className="w-8 h-8" />, title: "Consultoria", desc: "Apoio estratégico na tomada de decisões baseada em dados reais.", color: "red" }
  ];

  return (
    <section id="services" className="py-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-blue-500 font-bold uppercase tracking-[0.4em] text-[10px] mb-4">Nossas Soluções</h2>
          <h3 className="text-4xl font-bold font-montserrat text-white uppercase tracking-tight">Áreas de Atuação</h3>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, idx) => (
            <div key={idx} className="glass-card p-10 rounded-3xl hover:bg-slate-800/40 transition-all border-white/5 group hover:-translate-y-2 duration-300">
              <div className="text-blue-500 mb-8 group-hover:scale-110 transition-transform">{service.icon}</div>
              <h4 className="text-xl font-bold text-white mb-4 uppercase tracking-tight">{service.title}</h4>
              <p className="text-slate-400 text-sm leading-relaxed">{service.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Contact = () => {
  return (
    <section id="contact" className="py-24 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4">
        <div className="glass-card rounded-[3rem] p-12 lg:p-20 border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] -mr-48 -mt-48"></div>
          
          <div className="grid lg:grid-cols-2 gap-16 relative z-10">
            <div>
              <h2 className="text-blue-500 font-bold uppercase tracking-[0.4em] text-[10px] mb-4">Fale Conosco</h2>
              <h3 className="text-4xl lg:text-5xl font-extrabold font-montserrat text-white mb-8 uppercase leading-tight">
                Humanize seus <br />Dados hoje
              </h3>
              <p className="text-slate-400 text-lg mb-12 max-w-md">
                Saia da obscuridade das planilhas manuais. Bruno Sacramento está pronto para diagnosticar seu negócio.
              </p>
              
              <div className="space-y-8">
                <a href="mailto:bruno@incrementalconsultoria.com.br" className="flex items-center gap-6 group max-w-fit">
                  <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    <Mail size={28} />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">E-mail Profissional</span>
                    <span className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">bruno@incrementalconsultoria.com.br</span>
                  </div>
                </a>
                
                <a href="https://wa.me/5511976956510" target="_blank" rel="noopener noreferrer" className="flex items-center gap-6 group max-w-fit">
                  <div className="w-16 h-16 bg-emerald-600/10 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                    <Phone size={28} />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">WhatsApp Business</span>
                    <span className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">(11) 9 7695-6510</span>
                  </div>
                </a>
              </div>
            </div>

            <div className="bg-white/[0.02] rounded-[2.5rem] p-10 border border-white/5 flex flex-col justify-center items-center text-center">
                <div className="w-24 h-24 bg-blue-600/20 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-blue-600/10">
                  <MessageSquare className="text-blue-500" size={40} />
                </div>
                <h4 className="text-2xl font-bold text-white mb-4 uppercase tracking-widest">Bruno Sacramento</h4>
                <p className="text-slate-400 text-sm mb-10 max-w-xs">Consultoria focada em lucro e caixa para o seu negócio.</p>
                
                <a 
                  href="https://wa.me/5511976956510"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-2xl transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center gap-3 uppercase text-sm tracking-[0.1em]"
                >
                  Diagnóstico Gratuito <ArrowRight size={20} />
                </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default function App() {
  return (
    <div className="bg-slate-950 min-h-screen text-slate-200 selection:bg-blue-600 selection:text-white">
      <Header />
      <Hero />
      <About />
      <Services />
      <Portfolio />
      <Contact />
      
      <footer className="py-12 border-t border-white/5 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-600 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
           <p>© 2004-2024 Incremental Consultoria de Resultados.</p>
           <div className="flex items-center gap-6">
              <span className="text-blue-500">Bruno Sacramento</span>
              <span className="hidden md:block text-slate-800">|</span>
              <span className="text-slate-500 hover:text-white transition-colors">(11) 9 7695-6510</span>
           </div>
        </div>
      </footer>

      {/* Ações Fixas */}
      <a 
        href="https://wa.me/5511976956510"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 left-8 bg-emerald-600 text-white p-5 rounded-2xl shadow-2xl z-40 hover:bg-emerald-700 transition-all transform hover:scale-110 border border-emerald-500/20 flex items-center gap-3 group"
      >
        <Phone size={24} className="group-hover:rotate-12 transition-transform" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 whitespace-nowrap font-bold text-sm">Falar com Bruno</span>
      </a>
      
      <button 
        onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
        className="fixed bottom-8 right-8 bg-slate-900 text-white p-5 rounded-2xl shadow-2xl z-40 hover:bg-slate-800 transition-all border border-white/5"
        title="Voltar ao topo"
      >
        <ChevronUp size={24} />
      </button>
    </div>
  );
}
