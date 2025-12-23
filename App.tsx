
import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  ChevronRight, 
  BarChart3, 
  PieChart, 
  Database, 
  TrendingUp, 
  Users, 
  Settings, 
  MessageSquare, 
  Mail, 
  Phone, 
  Linkedin, 
  Github,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Zap,
  Briefcase,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { ServiceItem, CaseStudyItem, PortfolioReport, ContactFormData, FAQItem } from './types';

// --- Sub-Components ---

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setIsOpen(false);
    }
  };

  const navLinks = [
    { name: 'Início', id: 'home' },
    { name: 'Sobre', id: 'about' },
    { name: 'Serviços', id: 'services' },
    { name: 'Portfólio', id: 'portfolio' },
    { name: 'Cases', id: 'cases' },
    { name: 'FAQ', id: 'faq' },
    { name: 'Contato', id: 'contact' },
  ];

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-slate-950/90 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection('home')}>
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold font-montserrat tracking-tight">INCREMENTAL<span className="text-blue-500 font-light">CONSULTORIA</span></span>
        </div>

        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <button 
              key={link.id} 
              onClick={() => scrollToSection(link.id)}
              className="text-xs font-semibold text-slate-400 hover:text-blue-400 transition-colors uppercase tracking-widest"
            >
              {link.name}
            </button>
          ))}
          <button 
            onClick={() => scrollToSection('contact')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full text-sm font-bold transition-all shadow-lg hover:shadow-blue-500/30"
          >
            Fale Conosco
          </button>
        </nav>

        <button className="lg:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      <div className={`lg:hidden fixed inset-0 bg-slate-950 z-40 flex flex-col items-center justify-center gap-8 transition-transform duration-500 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {navLinks.map((link) => (
          <button 
            key={link.id} 
            onClick={() => scrollToSection(link.id)}
            className="text-2xl font-bold text-slate-200 hover:text-blue-400 uppercase tracking-widest"
          >
            {link.name}
          </button>
        ))}
        <button 
          onClick={() => scrollToSection('contact')}
          className="bg-blue-600 px-8 py-3 rounded-full text-lg font-bold"
        >
          Solicitar Orçamento
        </button>
      </div>
    </header>
  );
};

const Hero = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      window.scrollTo({
        top: element.getBoundingClientRect().top + window.pageYOffset - offset,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden pt-20">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-600/10 to-transparent z-0"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-24 left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px]"></div>

      <div className="max-w-7xl mx-auto px-4 z-10 grid lg:grid-cols-2 gap-12 items-center">
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
            <Zap size={14} /> Power BI • DAX • Python • Finanças
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold font-montserrat leading-tight mb-6">
            Humanizando <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Dados</span> para impulsionar seu <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Caixa</span>
          </h1>
          <p className="text-lg text-slate-400 mb-8 max-w-lg leading-relaxed">
            Consultoria especializada em transformar complexidade financeira em dashboards acionáveis. Foco em lucro real, desde 2004.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => scrollToSection('portfolio')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-600/20"
            >
              Portfólio Interativo <BarChart3 size={20} />
            </button>
            <button 
              onClick={() => scrollToSection('contact')}
              className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border border-slate-700"
            >
              Consultoria Grátis <ArrowRight size={20} />
            </button>
          </div>
        </div>

        <div className="hidden lg:block relative">
          <div className="glass-card p-4 rounded-3xl relative overflow-hidden shadow-2xl border-white/5 bg-white/[0.02]">
            <img 
              src="https://images.unsplash.com/photo-1551288049-bbbda5366392?q=80&w=1470&auto=format&fit=crop" 
              alt="Dashboard Preview" 
              className="rounded-2xl w-full h-auto opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent flex items-end p-8">
              <div className="w-full flex justify-between items-end">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">Visão 360° do Negócio</h3>
                  <p className="text-slate-300 text-sm">Decisões baseadas em evidências reais.</p>
                </div>
                <div className="bg-blue-500 p-3 rounded-xl shadow-lg">
                  <Cpu className="text-white" />
                </div>
              </div>
            </div>
          </div>
          {/* Animated Float Elements */}
          <div className="absolute -bottom-8 -left-8 glass-card p-6 rounded-2xl shadow-xl animate-float border-white/10">
            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Margem Bruta</p>
            <p className="text-2xl font-bold text-emerald-400">+18.5%</p>
          </div>
          <div className="absolute -top-8 -right-8 glass-card p-6 rounded-2xl shadow-xl animate-float-delayed border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                <ShieldCheck className="text-blue-400 w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold">Confiança</p>
                <p className="text-lg font-bold text-white">Certificado</p>
              </div>
            </div>
          </div>
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
            <div className="grid grid-cols-2 gap-4">
              <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1470&auto=format&fit=crop" alt="Consulting Team" className="rounded-2xl h-64 w-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
              <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1426&auto=format&fit=crop" alt="Analysis" className="rounded-2xl h-80 w-full object-cover mt-8 grayscale hover:grayscale-0 transition-all duration-500" />
            </div>
            <div className="absolute -bottom-10 -right-6 glass-card p-10 rounded-2xl shadow-2xl bg-blue-600/5 border-blue-500/20">
              <p className="text-5xl font-black text-blue-500 mb-1 tracking-tighter">20+</p>
              <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Anos de Consultoria</p>
            </div>
          </div>

          <div>
            <h2 className="text-blue-500 font-bold uppercase tracking-[0.3em] text-[10px] mb-4">A Incremental</h2>
            <h3 className="text-4xl font-bold font-montserrat mb-6 leading-tight">Expertise Financeira que Humaniza os Números</h3>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              Trabalhamos para que você entenda exatamente o que os dados estão dizendo. Nossa missão é transformar complexidade técnica em clareza estratégica para donos e gestores de negócio.
            </p>
            <div className="grid gap-4 mb-10">
              {[
                "Especialistas em Curva ABC e Margem de Contribuição",
                "Desenvolvimento Ágil de Dashboards Interativos",
                "Integração de dados ERP, Planilhas e APIs Python",
                "Mentoria técnica para times internos de BI"
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3 group">
                  <div className="bg-blue-500/10 p-1 rounded-full text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <CheckCircle2 size={18} />
                  </div>
                  <span className="text-slate-300 font-medium group-hover:text-white transition-colors">{text}</span>
                </div>
              ))}
            </div>
            <div className="p-6 bg-blue-600/5 border border-blue-500/10 rounded-2xl italic text-slate-400 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 transform scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-500"></div>
              "O dashboard é o meio, o resultado no seu caixa é o fim. Não entregamos apenas BI, entregamos inteligência de negócio."
              <br />
              <span className="font-bold text-white not-italic mt-2 block tracking-wider">— Bruno Sacramento, Diretor</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Services = () => {
  const services: ServiceItem[] = [
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Dashboards Power BI",
      desc: "Desenvolvimento de visões executivas e operacionais com as melhores práticas de UX/UI.",
      color: "blue"
    },
    {
      icon: <Database className="w-8 h-8" />,
      title: "Modelagem DAX",
      desc: "Criação de métricas financeiras complexas para análises de ano contra ano, margem e giro.",
      color: "indigo"
    },
    {
      icon: <Settings className="w-8 h-8" />,
      title: "ETL com Python",
      desc: "Automação de limpeza e tratamento de dados complexos que o Power Query não resolve sozinho.",
      color: "green"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Análise de DRE",
      desc: "Estruturação completa do seu Demonstrativo de Resultados automatizado e em tempo real.",
      color: "orange"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Squad BI / Alocação",
      desc: "Temos especialistas prontos para atuar no seu projeto como uma extensão do seu time.",
      color: "purple"
    },
    {
      icon: <Briefcase className="w-8 h-8" />,
      title: "Gestão Financeira",
      desc: "Consultoria consultiva para melhoria de processos, contas a pagar/receber e fluxo de caixa.",
      color: "red"
    }
  ];

  const colorMap: Record<string, string> = {
    blue: "from-blue-500 to-blue-600",
    indigo: "from-indigo-500 to-indigo-600",
    green: "from-emerald-500 to-emerald-600",
    orange: "from-orange-500 to-orange-600",
    purple: "from-purple-500 to-purple-600",
    red: "from-red-500 to-red-600"
  };

  return (
    <section id="services" className="py-24">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-blue-500 font-bold uppercase tracking-[0.3em] text-[10px] mb-4">Serviços</h2>
        <h3 className="text-4xl font-bold font-montserrat mb-16">Nossa Expertise Técnica</h3>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
          {services.map((service, index) => (
            <div key={index} className="group glass-card p-10 rounded-3xl hover:bg-slate-800/40 transition-all duration-500 hover:-translate-y-2 border-white/5">
              <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${colorMap[service.color]} text-white mb-8 shadow-xl shadow-${service.color}-500/10`}>
                {service.icon}
              </div>
              <h4 className="text-xl font-bold mb-4 group-hover:text-blue-400 transition-colors tracking-tight">{service.title}</h4>
              <p className="text-slate-400 leading-relaxed mb-8 text-sm">
                {service.desc}
              </p>
              <button className="text-blue-500 font-bold text-xs uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
                Saiba Mais <ChevronRight size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Portfolio = () => {
  const reports: PortfolioReport[] = [
    {
      title: "Análise de Vendas & Mix de Produtos",
      desc: "Controle total de faturamento, tickets médios e performance por categoria.",
      link: "https://app.powerbi.com/view?r=eyJrIjoiYTM5ZTU1ODgtOWMxMC00MDUzLWJjMTItN2UwNTVkOWE5MjE0IiwidCI6IjRiNDZjOWZkLTJmNmEtNDc2NS1iNDZkLWRhMmRhM2I4YTI4MyJ9"
    },
    {
      title: "Gestão de Fluxo de Caixa Dinâmico",
      desc: "Projeções financeiras e análise de entradas/saídas em tempo real.",
      link: "https://app.powerbi.com/view?r=eyJrIjoiNDFkZDVkYTgtYWRlNS00OGQ5LWFmYjAtMmE3ZDVjNjRhZjg2IiwidCI6IjRiNDZjOWZkLTJmNmEtNDc2NS1iNDZkLWRhMmRhM2I4YTI4MyJ9"
    },
    {
        title: "DRE - Demonstrativo de Resultados",
        desc: "Consolidação de receitas, custos e despesas para visão clara do EBITDA.",
        link: "https://app.powerbi.com/view?r=eyJrIjoiYTM5ZTU1ODgtOWMxMC00MDUzLWJjMTItN2UwNTVkOWE5MjE0IiwidCI6IjRiNDZjOWZkLTJmNmEtNDc2NS1iNDZkLWRhMmRhM2I4YTI4MyJ9" // Placeholder same as first for layout
    }
  ];

  return (
    <section id="portfolio" className="py-24 bg-slate-900/30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <h2 className="text-blue-500 font-bold uppercase tracking-[0.3em] text-[10px] mb-4">Portfólio</h2>
            <h3 className="text-4xl font-bold font-montserrat tracking-tight">Dashboards em Operação</h3>
          </div>
          <div className="max-w-md">
            <p className="text-slate-400 text-sm">
              Explore dashboards reais. Interaja com os filtros para ver como entregamos insights prontos para uso.
            </p>
          </div>
        </div>

        <div className="grid gap-20">
          {reports.map((report, index) => (
            <div key={index} className="group">
              <div className="flex flex-col lg:flex-row items-center gap-10 mb-8">
                <div className="flex-grow">
                  <h4 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{report.title}</h4>
                  <p className="text-slate-400 max-w-2xl">{report.desc}</p>
                </div>
                <a 
                  href={report.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white px-6 py-3 rounded-xl transition-all flex items-center gap-2 font-bold text-sm border border-blue-500/20"
                >
                  Abrir Tela Cheia <ExternalLink size={16} />
                </a>
              </div>
              <div className="relative aspect-video w-full rounded-3xl overflow-hidden glass-card shadow-2xl border-white/5 ring-1 ring-white/10 group-hover:ring-blue-500/30 transition-all duration-700">
                <iframe 
                  title={report.title}
                  src={report.link}
                  className="absolute inset-0 w-full h-full border-0"
                  allowFullScreen={true}
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CaseStudies = () => {
  const cases: CaseStudyItem[] = [
    {
      icon: <Briefcase size={24} />,
      client: "Padaria Real",
      segment: "Food Service",
      challenge: "Dificuldade em identificar produtos com baixa margem em mix extenso.",
      solution: "Curva ABC de margem dinâmica integrada ao ERP via Python.",
      results: ["Aumento de 8% na margem bruta", "Redução de 15% em perdas"],
      color: "orange"
    },
    {
      icon: <TrendingUp size={24} />,
      client: "Sacolão Pira",
      segment: "Varejo Alimentar",
      challenge: "Falta de controle de estoque e quebras afetando o caixa.",
      solution: "Monitoramento diário de perdas com alertas automáticos.",
      results: ["Redução de 12% em desperdício", "Payback do projeto em 3 meses"],
      color: "green"
    },
    {
      icon: <Database size={24} />,
      client: "Global Assets",
      segment: "Real Estate",
      challenge: "Planilhas manuais impossibilitavam análise de rentabilidade por imóvel.",
      solution: "Portal de BI consolidado com indicadores de Yield e Vacância.",
      results: ["Consolidação instantânea", "Aumento de 5% no faturamento médio"],
      color: "blue"
    }
  ];

  return (
    <section id="cases" className="py-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-blue-500 font-bold uppercase tracking-[0.3em] text-[10px] mb-4">Resultados</h2>
          <h3 className="text-4xl font-bold font-montserrat">Histórias de Sucesso</h3>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {cases.map((item, index) => (
            <div key={index} className="p-10 rounded-3xl bg-slate-900/50 border border-slate-800/50 hover:border-blue-500/20 transition-all group flex flex-col">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-2xl bg-blue-600/10 text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white">{item.client}</h4>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.segment}</p>
                </div>
              </div>
              
              <div className="space-y-6 mb-10 flex-grow">
                <div>
                  <p className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em] mb-2">Desafio</p>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.challenge}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em] mb-2">Solução</p>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.solution}</p>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-800">
                <div className="grid gap-3">
                  {item.results.map((res, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-bold text-white tracking-tight">{res}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const faqs: FAQItem[] = [
        { 
            question: "Quanto tempo demora para implementar um projeto de BI?", 
            answer: "Depende da complexidade dos dados. Projetos iniciais levam em média de 3 a 5 semanas para entrega dos primeiros dashboards de valor." 
        },
        { 
            question: "Meus dados ficam seguros? Como é feito o acesso?", 
            answer: "Sim, utilizamos as camadas de segurança nativas da Microsoft (Power BI Service) e Python. O acesso é restrito e auditável, garantindo total conformidade com a LGPD." 
        },
        { 
            question: "Vocês fazem integração com qualquer ERP?", 
            answer: "Sim, através de conexões via Banco de Dados (SQL), APIs ou exportações automatizadas tratadas com Python. Temos vasta experiência em ERPs do mercado." 
        },
        { 
            question: "É necessário pagar licença do Power BI?", 
            answer: "Para visualização compartilhada segura, a Microsoft exige licenças Power BI Pro. Nós ajudamos você a dimensionar o menor custo possível de licenciamento." 
        }
    ];

    return (
        <section id="faq" className="py-24 bg-slate-900/20">
            <div className="max-w-3xl mx-auto px-4">
                <h2 className="text-blue-500 font-bold uppercase tracking-[0.3em] text-[10px] mb-4 text-center">FAQ</h2>
                <h3 className="text-4xl font-bold font-montserrat mb-16 text-center">Dúvidas Frequentes</h3>
                
                <div className="space-y-4">
                    {faqs.map((faq, idx) => (
                        <div key={idx} className="glass-card rounded-2xl overflow-hidden border-white/5">
                            <button 
                                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                                className="w-full flex items-center justify-between p-6 text-left hover:bg-white/[0.02] transition-colors"
                            >
                                <span className="font-bold text-slate-200">{faq.question}</span>
                                {openIndex === idx ? <ChevronUp className="text-blue-500" /> : <ChevronDown className="text-slate-500" />}
                            </button>
                            <div className={`px-6 transition-all duration-300 overflow-hidden ${openIndex === idx ? 'pb-6 max-h-40' : 'max-h-0'}`}>
                                <p className="text-slate-400 text-sm leading-relaxed border-t border-white/5 pt-4">
                                    {faq.answer}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const Contact = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setTimeout(() => {
      setStatus('success');
      setFormData({ name: '', email: '', phone: '', message: '' });
      setTimeout(() => setStatus('idle'), 5000);
    }, 1500);
  };

  return (
    <section id="contact" className="py-24 relative overflow-hidden">
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-blue-600/5 rounded-full blur-[100px]"></div>
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16">
          <div>
            <h2 className="text-blue-500 font-bold uppercase tracking-[0.3em] text-[10px] mb-4">Contato</h2>
            <h3 className="text-4xl font-bold font-montserrat mb-10 leading-tight">Vamos construir sua cultura de dados juntos</h3>
            
            <div className="space-y-10">
              <div className="flex items-center gap-6 group">
                <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                  <Mail size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">E-mail Corporativo</p>
                  <a href="mailto:contato@incrementalconsultoria.com.br" className="text-lg font-bold hover:text-blue-400 transition-colors">contato@incrementalconsultoria.com.br</a>
                </div>
              </div>
              <div className="flex items-center gap-6 group">
                <div className="w-14 h-14 bg-emerald-600/10 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                  <Phone size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">WhatsApp Business</p>
                  <a href="https://wa.me/5511976273887" className="text-lg font-bold hover:text-emerald-400 transition-colors">(11) 97627-3887</a>
                </div>
              </div>
              <div className="flex items-center gap-4 pt-10 border-t border-slate-900">
                <a href="https://linkedin.com/company/incrementalconsultoria" target="_blank" className="p-4 bg-slate-900 rounded-2xl hover:bg-blue-600 hover:scale-110 transition-all border border-slate-800">
                  <Linkedin size={20} />
                </a>
                <a href="https://github.com/Bsacam89/Incremental" target="_blank" className="p-4 bg-slate-900 rounded-2xl hover:bg-slate-700 hover:scale-110 transition-all border border-slate-800">
                  <Github size={20} />
                </a>
              </div>
            </div>
          </div>

          <div className="glass-card p-10 rounded-[2.5rem] border-white/5 shadow-2xl relative bg-white/[0.01]">
            {status === 'success' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 rounded-[2.5rem] z-20 p-10 text-center animate-in fade-in duration-500">
                <div className="w-20 h-20 bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center mb-8">
                  <CheckCircle2 size={48} />
                </div>
                <h4 className="text-3xl font-bold mb-4">Mensagem Recebida!</h4>
                <p className="text-slate-400">Bruno Sacramento entrará em contato com você em até 24 horas.</p>
                <button 
                  onClick={() => setStatus('idle')}
                  className="mt-10 px-8 py-3 bg-slate-800 rounded-xl text-sm font-bold hover:bg-slate-700 transition-all"
                >
                  Enviar outra mensagem
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2">Seu Nome</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none transition-all placeholder:text-slate-700"
                    placeholder="Ex: João Silva"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2">E-mail</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none transition-all placeholder:text-slate-700"
                    placeholder="joao@empresa.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2">WhatsApp</label>
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none transition-all placeholder:text-slate-700"
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-2">Qual seu desafio?</label>
                <textarea 
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-4 focus:border-blue-500 outline-none transition-all placeholder:text-slate-700 resize-none"
                  placeholder="Conte um pouco sobre suas necessidades de dados..."
                ></textarea>
              </div>
              <button 
                type="submit" 
                disabled={status === 'sending'}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-2xl shadow-2xl shadow-blue-600/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {status === 'sending' ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>Enviar Mensagem <MessageSquare size={20} /></>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-slate-950 pt-24 pb-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          <div className="col-span-1 lg:col-span-2">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-xl shadow-blue-600/20">
                <BarChart3 className="text-white w-7 h-7" />
              </div>
              <span className="text-2xl font-bold font-montserrat tracking-tight">INCREMENTAL<span className="text-blue-500 font-light italic">BI</span></span>
            </div>
            <p className="text-slate-500 max-w-sm leading-relaxed mb-8 text-sm">
              Potencializando resultados através da inteligência de dados aplicada ao seu negócio. Especialistas em Power BI e Python para o mercado financeiro e de varejo.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-8 text-xs uppercase tracking-[0.3em]">Navegação</h4>
            <ul className="space-y-5 text-slate-400 text-sm font-medium">
              <li><button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="hover:text-blue-400 transition-colors">Página Inicial</button></li>
              <li><button onClick={() => document.getElementById('services')?.scrollIntoView({behavior: 'smooth'})} className="hover:text-blue-400 transition-colors">Nossos Serviços</button></li>
              <li><button onClick={() => document.getElementById('cases')?.scrollIntoView({behavior: 'smooth'})} className="hover:text-blue-400 transition-colors">Cases Reais</button></li>
              <li><button onClick={() => document.getElementById('portfolio')?.scrollIntoView({behavior: 'smooth'})} className="hover:text-blue-400 transition-colors">Portfólio BI</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-8 text-xs uppercase tracking-[0.3em]">Incremental</h4>
            <ul className="space-y-5 text-slate-400 text-sm font-medium">
              <li className="flex items-start gap-3">
                  <Mail size={18} className="text-blue-500 mt-0.5 shrink-0" />
                  <span>contato@incrementalconsultoria.com.br</span>
              </li>
              <li className="flex items-start gap-3">
                  <Phone size={18} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span>(11) 97627-3887</span>
              </li>
              <li className="flex items-start gap-3">
                  <Linkedin size={18} className="text-blue-600 mt-0.5 shrink-0" />
                  <span>LinkedIn Page</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-12 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-6 text-slate-600 text-[10px] font-bold uppercase tracking-widest">
          <p>© 2024 Incremental Consultoria de Resultados.</p>
          <div className="flex items-center gap-6">
              <p>CNPJ: 00.000.000/0001-00</p>
              <p>São Paulo, SP</p>
          </div>
          <p className="text-blue-500">Desenvolvido por Bruno Sacramento</p>
        </div>
      </div>
    </footer>
  );
};

// --- Main App ---

export default function App() {
  return (
    <div className="min-h-screen selection:bg-blue-600 selection:text-white">
      <Header />
      <Hero />
      <About />
      <Services />
      <Portfolio />
      <CaseStudies />
      <FAQ />
      <Contact />
      <Footer />
      
      {/* Back to Top */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-10 right-10 bg-blue-600 text-white p-5 rounded-2xl shadow-2xl z-40 hover:bg-blue-700 transition-all transform hover:scale-110 active:scale-95 group border border-blue-500/20"
      >
        <ChevronUp size={24} className="group-hover:-translate-y-1 transition-transform" />
      </button>

      {/* WhatsApp Fixed Button */}
      <a 
        href="https://wa.me/5511976273887"
        target="_blank"
        className="fixed bottom-10 left-10 bg-emerald-600 text-white p-5 rounded-2xl shadow-2xl z-40 hover:bg-emerald-700 transition-all transform hover:scale-110 active:scale-95 group border border-emerald-500/20"
      >
        <Phone size={24} className="group-hover:rotate-12 transition-transform" />
      </a>
    </div>
  );
}
