
import React, { useState, useEffect, useRef } from 'react';
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
  Wallet,
  Quote,
  Award,
  PackageSearch,
  ShoppingCart
} from 'lucide-react';
import { ServiceItem, PortfolioReport } from './types';

// --- Scroll animation hook ---
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

// Wrapper that fades + slides up on scroll
const FadeIn = ({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) => {
  const { ref, visible } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

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
          {['Início', 'A Incremental', 'Serviços', 'Dashboards', 'Cases', 'Contato'].map((name) => (
            <button
              key={name}
              onClick={() => scrollToSection(
                name === 'Dashboards' ? 'portfolio' :
                name === 'Início' ? 'home' :
                name === 'A Incremental' ? 'about' :
                name === 'Serviços' ? 'services' :
                name === 'Contato' ? 'contact' :
                name.toLowerCase()
              )}
              className="text-xs font-semibold text-slate-400 hover:text-blue-400 transition-colors uppercase tracking-widest"
            >
              {name}
            </button>
          ))}
          <a
            href="https://wa.me/5511976273887"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg hover:shadow-blue-500/30 flex items-center gap-2"
          >
            Agendar Diagnóstico
          </a>
        </nav>

        <button className="lg:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      <div className={`lg:hidden fixed inset-0 bg-slate-950 z-40 flex flex-col items-center justify-center gap-8 transition-transform duration-500 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {['Início', 'A Incremental', 'Serviços', 'Dashboards', 'Cases', 'Contato'].map((name) => (
          <button
            key={name}
            onClick={() => scrollToSection(
              name === 'Dashboards' ? 'portfolio' :
              name === 'Início' ? 'home' :
              name === 'A Incremental' ? 'about' :
              name === 'Serviços' ? 'services' :
              name === 'Contato' ? 'contact' :
              name.toLowerCase()
            )}
            className="text-2xl font-bold text-slate-200 uppercase tracking-widest"
          >
            {name}
          </button>
        ))}
        <a href="https://wa.me/5511976273887" target="_blank" rel="noopener noreferrer" className="bg-blue-600 px-8 py-4 rounded-full text-lg font-bold text-white">Agendar Diagnóstico</a>
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
        <div className="relative min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-[0.15em] mb-6 max-w-full overflow-hidden">
            <Zap size={14} className="shrink-0" /> <span className="truncate">Desde 2004 • Power BI • Consultoria de Resultados</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-montserrat leading-tight mb-6 text-white uppercase">
            Incrementando <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Lucro e Caixa</span> Real
          </h1>
          <p className="text-lg text-slate-400 mb-8 max-w-lg leading-relaxed">
            Transformamos a relação dos gestores com os números. Humanizamos dados para que você tome decisões com clareza, consistência e resultado financeiro duradouro.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={() => document.getElementById('portfolio')?.scrollIntoView({behavior: 'smooth'})} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-600/20">
              Ver Dashboards <Eye size={20} />
            </button>
            <a href="https://wa.me/5511976273887" target="_blank" rel="noopener noreferrer" className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border border-slate-700">
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
      image: "/vendas.png",
      objective: "Visão detalhada de faturamento, preço médio e PVM (Preço, Volume e Mix) para entender o que realmente move o caixa.",
      kpis: ["Faturamento Mensal", "Preço Médio", "Impacto Mix", "Não Vendas"],
      impact: "Identificação precisa de variações de margem e faturamento por produto/segmento.",
      tags: ["Vendas", "PVM", "Comercial"]
    },
    {
      title: "Indicadores de Estoque",
      subtitle: "Prevenção de Ruptura e Giro",
      image: "/estoque.png",
      objective: "Monitoramento de produtos críticos: Estoque Zero, Ruptura de Risco e Margem Negativa.",
      kpis: ["Estoque Zero", "Ruptura (Risco)", "MG Negativa", "Ação Recomendada"],
      impact: "Redução de capital imobilizado e otimização imediata das compras e pedidos.",
      tags: ["Estoque", "Giro", "Operacional"]
    },
    {
      title: "Análise de Rotatividade",
      subtitle: "Giro de Produtos e Comportamento",
      image: "/rotatividade.png",
      objective: "Análise de frequência de compra e giro por departamento para otimização do mix de produtos.",
      kpis: ["Giro por Grupo", "Clientes Ativos", "Status de Giro", "Heatmap"],
      impact: "Decisões baseadas no comportamento real do consumidor final na loja.",
      tags: ["Rotatividade", "Mix", "Varejo"]
    },
    {
      title: "Análise de Despesas",
      subtitle: "Controle Orçamentário e DRE",
      image: "/despesas.png",
      objective: "Comparativo entre Orçado vs Real para garantir o cumprimento das metas financeiras.",
      kpis: ["Orçado vs Atual", "% Part Despesas", "Gastos Gerenciais", "Desvio %"],
      impact: "Visibilidade total dos custos fixos e variáveis com foco na preservação da margem líquida.",
      tags: ["Despesas", "Orçamento", "DRE"]
    }
  ];

  return (
    <section id="portfolio" className="py-24 bg-slate-900/30">
      <div className="max-w-7xl mx-auto px-4">
        <FadeIn>
          <div className="text-center mb-20">
            <h2 className="text-blue-500 font-bold uppercase tracking-[0.3em] text-[10px] mb-4">Portfólio de Dashboards</h2>
            <h3 className="text-4xl font-bold font-montserrat text-white uppercase tracking-tight">Inteligência que Gera Caixa</h3>
          </div>
        </FadeIn>

        <div className="grid gap-24">
          {reports.map((report, index) => (
            <FadeIn key={index} delay={100}>
            <div className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 items-center group`}>
              {/* Moldura do Dashboard estilo janela */}
              <div className="w-full lg:w-3/5 relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <div className="relative rounded-2xl overflow-hidden border border-slate-700/60 shadow-2xl shadow-black/40">
                  {/* Barra de título */}
                  <div className="flex items-center gap-2 px-4 py-3 bg-slate-800 border-b border-slate-700/60">
                    <div className="w-3 h-3 rounded-full bg-red-500/70"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/70"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/70"></div>
                    <span className="ml-3 text-[10px] font-medium text-slate-500 uppercase tracking-widest">{report.title}</span>
                  </div>
                  {/* Imagem do dashboard */}
                  <div className="aspect-video bg-slate-900 overflow-hidden">
                    <img
                      src={report.image}
                      alt={report.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                </div>
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
                  <a href="https://wa.me/5511976273887" target="_blank" rel="noopener noreferrer" className="bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border border-blue-500/20 inline-flex items-center gap-3">
                    Agendar Demonstração <ArrowRight size={14} />
                  </a>
                </div>
              </div>
            </div>
            </FadeIn>
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
                <h4 className="text-2xl font-bold text-white mb-6 uppercase tracking-tight">Nossa Metodologia</h4>
                <p className="text-slate-400 mb-8 leading-relaxed text-lg">
                  Começamos com uma conversa profunda para entender seu negócio. No segundo mês, implantamos o <strong className="text-white">processo de fechamento</strong> — coleta e organização mensal de dados que se transformam nos seus indicadores financeiros reais.
                </p>
                <div className="space-y-4">
                   <div className="flex items-center gap-4 group">
                      <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <CheckCircle2 size={18} />
                      </div>
                      <span className="text-slate-200 font-medium">Números Fundamentais personalizados</span>
                   </div>
                   <div className="flex items-center gap-4 group">
                      <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <CheckCircle2 size={18} />
                      </div>
                      <span className="text-slate-200 font-medium">Fechamento mensal de indicadores</span>
                   </div>
                   <div className="flex items-center gap-4 group">
                      <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <CheckCircle2 size={18} />
                      </div>
                      <span className="text-slate-200 font-medium">Ciclo contínuo de avaliação e ajustes</span>
                   </div>
                   <div className="flex items-center gap-4 group">
                      <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <CheckCircle2 size={18} />
                      </div>
                      <span className="text-slate-200 font-medium">Power BI & DAX com foco gerencial</span>
                   </div>
                </div>
             </div>
             <div className="absolute -bottom-10 -right-10 h-64 w-64 bg-blue-600 rounded-full blur-[120px] opacity-10"></div>
          </div>

          <div className="space-y-8">
            <h2 className="text-blue-500 font-bold uppercase tracking-[0.4em] text-[10px]">A Incremental</h2>
            <h3 className="text-4xl lg:text-5xl font-extrabold font-montserrat text-white uppercase leading-tight">Humanizando Números <br />Desde 2004</h3>
            <p className="text-slate-400 text-lg leading-relaxed">
              Acreditamos que os números devem estar a serviço do bem-estar de todos — clientes, colaboradores, sócios e parceiros. Nossa consultoria capacita gestores e líderes a usarem indicadores como ferramentas reais de decisão, gerando resultados financeiros consistentes e duradouros.
            </p>
            <div className="pt-4 flex items-center gap-8">
               <div>
                  <p className="text-3xl font-black text-white">20+</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Anos de Trajetória</p>
               </div>
               <div className="h-10 w-px bg-slate-800"></div>
               <div>
                  <p className="text-3xl font-black text-white">NCG</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Capital de Giro</p>
               </div>
               <div className="h-10 w-px bg-slate-800"></div>
               <div>
                  <p className="text-3xl font-black text-white">P.E.</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Ponto de Equilíbrio</p>
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
    { icon: <TrendingUp className="w-8 h-8" />, title: "Números Fundamentais", desc: "Margem de contribuição, ponto de equilíbrio, NCG e geração de caixa — personalizados para o seu negócio.", color: "blue" },
    { icon: <Wallet className="w-8 h-8" />, title: "BI Financeiro", desc: "DRE gerencial, fluxo de caixa e controle orçamentário com visão de Orçado vs Real.", color: "green" },
    { icon: <BarChart3 className="w-8 h-8" />, title: "BI Comercial", desc: "Análise PVM, mix de produtos e margem por unidade gerencial para potencializar faturamento.", color: "indigo" },
    { icon: <Database className="w-8 h-8" />, title: "Gestão de Estoque", desc: "Controle de ruptura, estoque zero e excessos para otimização de capital de giro.", color: "orange" },
    { icon: <Settings className="w-8 h-8" />, title: "ETL & Automação", desc: "Tratamento de dados via Python e SQL — do fechamento mensal à atualização automática de relatórios.", color: "purple" },
    { icon: <Briefcase className="w-8 h-8" />, title: "Consultoria Estratégica", desc: "Planejamento personalizado, implementação eficaz e ciclo contínuo de avaliação e ajustes.", color: "red" }
  ];

  return (
    <section id="services" className="py-24">
      <div className="max-w-7xl mx-auto px-4">
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="text-blue-500 font-bold uppercase tracking-[0.4em] text-[10px] mb-4">Nossas Soluções</h2>
            <h3 className="text-4xl font-bold font-montserrat text-white uppercase tracking-tight">Áreas de Atuação</h3>
          </div>
        </FadeIn>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, idx) => (
            <FadeIn key={idx} delay={idx * 80}>
              <div className="glass-card p-10 rounded-3xl hover:bg-slate-800/40 transition-all border-white/5 group hover:-translate-y-2 duration-300 h-full">
                <div className="text-blue-500 mb-8 group-hover:scale-110 transition-transform">{service.icon}</div>
                <h4 className="text-xl font-bold text-white mb-4 uppercase tracking-tight">{service.title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed">{service.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

const Cases = () => {
  const cases = [
    {
      segment: "Rede Varejista",
      region: "Interior de SP",
      icon: <ShoppingCart className="w-7 h-7" />,
      color: "blue",
      challenge: "Estoque descontrolado, ruptura frequente e capital de giro comprometido sem visibilidade do problema.",
      solution: "Implantação do dashboard de Indicadores de Estoque com mapeamento de Estoque Zero, Ruptura e Margem Negativa por departamento.",
      results: [
        { value: "−27%", label: "Capital imobilizado em estoque" },
        { value: "4%", label: "Ruptura (era 18% antes)" },
        { value: "3 meses", label: "Para estabilização dos KPIs" },
      ],
      quote: "Pela primeira vez conseguimos agir antes da ruptura acontecer, não depois.",
    },
    {
      segment: "Distribuidora Atacadista",
      region: "Minas Gerais",
      icon: <PackageSearch className="w-7 h-7" />,
      color: "emerald",
      challenge: "Faturamento crescia ano a ano, mas o lucro não acompanhava. Gestores não conseguiam identificar onde a margem estava sendo perdida.",
      solution: "Análise PVM completa com DRE gerencial e mapeamento de margem por mix de produto e cliente.",
      results: [
        { value: "+8,5pp", label: "Margem líquida em 4 meses" },
        { value: "12 SKUs", label: "Identificados como deficitários" },
        { value: "−R$340k", label: "Em custo oculto mapeado" },
      ],
      quote: "Os números sempre estiveram lá. A Incremental nos ajudou a enxergá-los pela primeira vez.",
    },
    {
      segment: "Empresa de Serviços",
      region: "Grande São Paulo",
      icon: <Briefcase className="w-7 h-7" />,
      color: "indigo",
      challenge: "Sem DRE gerencial estruturado, a empresa não sabia seu ponto de equilíbrio real nem quais contratos eram lucrativos.",
      solution: "Processo de fechamento mensal com Números Fundamentais: PE, NCG, margem de contribuição e geração de caixa por linha de serviço.",
      results: [
        { value: "+31%", label: "Lucro líquido no 1º ano" },
        { value: "2 linhas", label: "De serviço descontinuadas" },
        { value: "100%", label: "Visibilidade do fluxo de caixa" },
      ],
      quote: "Descobrimos que 30% do nosso faturamento nos custava mais do que gerava. Isso mudou tudo.",
    },
  ];

  const colorMap: Record<string, { bg: string; border: string; text: string; badge: string }> = {
    blue: {
      bg: "bg-blue-600/10",
      border: "border-blue-500/20",
      text: "text-blue-400",
      badge: "bg-blue-600/10 text-blue-400 border-blue-500/20",
    },
    emerald: {
      bg: "bg-emerald-600/10",
      border: "border-emerald-500/20",
      text: "text-emerald-400",
      badge: "bg-emerald-600/10 text-emerald-400 border-emerald-500/20",
    },
    indigo: {
      bg: "bg-indigo-600/10",
      border: "border-indigo-500/20",
      text: "text-indigo-400",
      badge: "bg-indigo-600/10 text-indigo-400 border-indigo-500/20",
    },
  };

  return (
    <section id="cases" className="py-24 bg-slate-900/40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className="text-blue-500 font-bold uppercase tracking-[0.3em] text-[10px] mb-4">Casos de Sucesso</h2>
          <h3 className="text-4xl font-bold font-montserrat text-white uppercase tracking-tight">Resultados Reais de Clientes</h3>
          <p className="text-slate-400 mt-4 max-w-xl mx-auto text-sm">Dados anonimizados. Resultados obtidos após implementação da metodologia Incremental.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {cases.map((c, i) => {
            const col = colorMap[c.color];
            return (
              <FadeIn key={i} delay={i * 120}>
              <div className={`glass-card rounded-3xl border ${col.border} flex flex-col overflow-hidden group hover:-translate-y-1 transition-all duration-300 h-full`}>
                {/* Header */}
                <div className={`p-6 ${col.bg} border-b ${col.border}`}>
                  <div className="flex items-center gap-3 mb-1">
                    <div className={`${col.text}`}>{c.icon}</div>
                    <div>
                      <p className={`text-xs font-bold uppercase tracking-widest ${col.text}`}>{c.segment}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">{c.region}</p>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 flex flex-col gap-5 flex-1">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Desafio</p>
                    <p className="text-slate-400 text-sm leading-relaxed">{c.challenge}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Solução</p>
                    <p className="text-slate-400 text-sm leading-relaxed">{c.solution}</p>
                  </div>

                  {/* Results */}
                  <div className={`rounded-2xl ${col.bg} border ${col.border} p-4`}>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                      <Award size={12} /> Resultados
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {c.results.map((r, j) => (
                        <div key={j} className="text-center">
                          <p className={`text-lg font-black ${col.text}`}>{r.value}</p>
                          <p className="text-[9px] text-slate-500 uppercase leading-tight mt-0.5">{r.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quote */}
                  <div className="flex gap-3 mt-auto pt-2">
                    <Quote size={16} className="text-slate-600 shrink-0 mt-0.5" />
                    <p className="text-slate-400 text-xs italic leading-relaxed">{c.quote}</p>
                  </div>
                </div>
              </div>
              </FadeIn>
            );
          })}
        </div>

        <div className="text-center mt-16">
          <a
            href="https://wa.me/5511976273887"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl font-bold transition-all shadow-xl shadow-blue-600/20 uppercase text-sm tracking-widest"
          >
            Quero Resultados Assim <ArrowRight size={18} />
          </a>
        </div>
      </div>
    </section>
  );
};

const Testimonials = () => {
  const testimonials = [
    {
      quote: "Antes do trabalho com a Incremental, eu achava que estava lucrando. Depois do primeiro fechamento, descobri que minha margem real era a metade do que imaginava. Em seis meses revertemos isso.",
      name: "Diretor Comercial",
      company: "Rede de Supermercados — Interior de SP",
      initials: "DC",
      color: "blue",
    },
    {
      quote: "A metodologia deles é diferente. Não é só dashboards bonitos — é entender o número, o que ele significa e o que fazer com ele. Isso mudou a forma como nossa diretoria toma decisão.",
      name: "CEO & Fundador",
      company: "Distribuidora Atacadista — MG",
      initials: "CF",
      color: "indigo",
    },
    {
      quote: "Tentei contratar BI antes e ficou caro e sem uso. Com a Incremental foi diferente: começamos pelo básico, o fechamento mensal, e construímos do chão. Hoje uso todo dia.",
      name: "Sócio-Gestor",
      company: "Empresa de Serviços — Grande SP",
      initials: "SG",
      color: "emerald",
    },
  ];

  const colorMap: Record<string, { ring: string; bg: string; text: string }> = {
    blue:    { ring: "ring-blue-500/30",    bg: "bg-blue-600",    text: "text-blue-400"    },
    indigo:  { ring: "ring-indigo-500/30",  bg: "bg-indigo-600",  text: "text-indigo-400"  },
    emerald: { ring: "ring-emerald-500/30", bg: "bg-emerald-600", text: "text-emerald-400" },
  };

  return (
    <section className="py-24 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-blue-500 font-bold uppercase tracking-[0.3em] text-[10px] mb-4">Depoimentos</h2>
          <h3 className="text-4xl font-bold font-montserrat text-white uppercase tracking-tight">O Que Dizem Nossos Clientes</h3>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => {
            const col = colorMap[t.color];
            return (
              <FadeIn key={i} delay={i * 100}>
              <div className="glass-card rounded-3xl p-8 border-white/5 flex flex-col gap-6 hover:-translate-y-1 transition-all duration-300 h-full">
                <Quote size={28} className={col.text} />
                <p className="text-slate-300 text-sm leading-relaxed flex-1 italic">"{t.quote}"</p>
                <div className="flex items-center gap-4 pt-2 border-t border-white/5">
                  <div className={`w-10 h-10 rounded-full ${col.bg} flex items-center justify-center text-white text-xs font-black ring-2 ${col.ring}`}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{t.name}</p>
                    <p className="text-slate-500 text-[10px] uppercase tracking-widest">{t.company}</p>
                  </div>
                </div>
              </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const Contact = () => {
  const [form, setForm] = useState({ name: '', company: '', revenue: '', whatsapp: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = encodeURIComponent(
      `Olá! Vim pelo site da Incremental Consultoria.\n\n` +
      `*Nome:* ${form.name}\n` +
      `*Empresa:* ${form.company}\n` +
      `*Faturamento:* ${form.revenue}\n` +
      `*WhatsApp:* ${form.whatsapp}\n` +
      (form.message ? `*Mensagem:* ${form.message}` : '')
    );
    window.open(`https://wa.me/5511976273887?text=${text}`, '_blank');
    setSubmitted(true);
  };

  const inputClass = "w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500/60 focus:bg-slate-800 transition-all";

  return (
    <section id="contact" className="py-24 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4">
        <div className="glass-card rounded-2xl sm:rounded-[3rem] p-6 sm:p-12 lg:p-20 border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] -mr-48 -mt-48"></div>

          <div className="grid lg:grid-cols-2 gap-16 relative z-10">
            {/* Lado esquerdo — info */}
            <div>
              <h2 className="text-blue-500 font-bold uppercase tracking-[0.4em] text-[10px] mb-4">Fale Conosco</h2>
              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-montserrat text-white mb-8 uppercase leading-tight">
                Incremente seu <br />Lucro hoje
              </h3>
              <p className="text-slate-400 text-lg mb-12 max-w-md">
                Saia da obscuridade das planilhas manuais. A Incremental está pronta para diagnosticar seu negócio e transformar números em decisões reais.
              </p>

              <div className="space-y-8">
                <a href="mailto:contato@incrementalconsultoria.com.br" className="flex items-center gap-6 group max-w-fit">
                  <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    <Mail size={28} />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">E-mail Profissional</span>
                    <span className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">contato@incrementalconsultoria.com.br</span>
                  </div>
                </a>

                <a href="https://wa.me/5511976273887" target="_blank" rel="noopener noreferrer" className="flex items-center gap-6 group max-w-fit">
                  <div className="w-16 h-16 bg-emerald-600/10 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                    <Phone size={28} />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">WhatsApp Business</span>
                    <span className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">(11) 9 7627-3887</span>
                  </div>
                </a>
              </div>
            </div>

            {/* Lado direito — formulário */}
            <div className="bg-white/[0.02] rounded-3xl p-8 border border-white/5">
              {submitted ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-6 py-12">
                  <div className="w-20 h-20 bg-emerald-600/20 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="text-emerald-400" size={40} />
                  </div>
                  <h4 className="text-2xl font-bold text-white uppercase tracking-tight">Mensagem Enviada!</h4>
                  <p className="text-slate-400 text-sm max-w-xs">Você será redirecionado para o WhatsApp. Responderemos em breve.</p>
                  <button onClick={() => setSubmitted(false)} className="text-blue-400 text-xs font-bold uppercase tracking-widest hover:text-blue-300 transition-colors">
                    Enviar outra mensagem
                  </button>
                </div>
              ) : (
                <>
                  <h4 className="text-lg font-bold text-white uppercase tracking-widest mb-6">Diagnóstico Gratuito</h4>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-1.5">Seu nome *</label>
                        <input name="name" required value={form.name} onChange={handleChange} placeholder="João Silva" className={inputClass} />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-1.5">Empresa *</label>
                        <input name="company" required value={form.company} onChange={handleChange} placeholder="Empresa Ltda." className={inputClass} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-1.5">Faturamento mensal</label>
                        <select name="revenue" value={form.revenue} onChange={handleChange} className={inputClass}>
                          <option value="" disabled>Selecione...</option>
                          <option value="Até R$ 500k">Até R$ 500k</option>
                          <option value="R$ 500k – R$ 2M">R$ 500k – R$ 2M</option>
                          <option value="R$ 2M – R$ 10M">R$ 2M – R$ 10M</option>
                          <option value="Acima de R$ 10M">Acima de R$ 10M</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-1.5">WhatsApp *</label>
                        <input name="whatsapp" required value={form.whatsapp} onChange={handleChange} placeholder="(11) 9 0000-0000" className={inputClass} />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-1.5">Qual é sua maior dificuldade com dados?</label>
                      <textarea name="message" value={form.message} onChange={handleChange} rows={3} placeholder="Ex: Não sei minha margem real, não consigo acompanhar o estoque..." className={`${inputClass} resize-none`} />
                    </div>

                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 uppercase text-sm tracking-widest mt-2">
                      Solicitar Diagnóstico <ArrowRight size={18} />
                    </button>
                    <p className="text-[10px] text-slate-600 text-center">Ao enviar, você será redirecionado ao WhatsApp para continuar a conversa.</p>
                  </form>
                </>
              )}
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
      <Cases />
      <Testimonials />
      <Contact />
      
      <footer className="py-12 border-t border-white/5 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-600 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
           <p>© 2004-2025 Incremental Consultoria de Resultados.</p>
           <div className="flex items-center gap-6">
              <a href="https://www.incrementalconsultoria.com.br" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-400 transition-colors">incrementalconsultoria.com.br</a>
              <span className="hidden md:block text-slate-800">|</span>
              <a href="https://wa.me/5511976273887" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-colors">(11) 9 7627-3887</a>
           </div>
        </div>
      </footer>

      {/* Ações Fixas */}
      <a 
        href="https://wa.me/5511976273887"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 left-8 bg-emerald-600 text-white p-5 rounded-2xl shadow-2xl z-40 hover:bg-emerald-700 transition-all transform hover:scale-110 border border-emerald-500/20 flex items-center gap-3 group"
      >
        <Phone size={24} className="group-hover:rotate-12 transition-transform" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 whitespace-nowrap font-bold text-sm">Falar Conosco</span>
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
