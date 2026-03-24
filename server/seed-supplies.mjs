// Seed script for supply categories and items (PostgreSQL/Supabase)
// Run: node server/seed-supplies.mjs

import postgres from "postgres";

const DATABASE_URL = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("SUPABASE_DB_URL or DATABASE_URL not set");
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { ssl: 'require' });

const categories = [
  {
    code: "01",
    name: "Serviços Preliminares e Projetos",
    items: [
      "Projeto Arquitetônico", "Projeto Estrutural", "Projeto Elétrico",
      "Projeto Hidrossanitário", "Sondagem de Solo", "Levantamento Topográfico",
      "Taxas de Prefeitura/Alvará", "Ligação Provisória de Água",
      "Ligação Provisória de Luz", "Tapume", "Limpeza do Terreno",
      "Locação de Caçamba", "Demolição"
    ]
  },
  {
    code: "02",
    name: "Fundações",
    items: [
      "Escavação", "Estacas", "Sapatas", "Radier", "Vigas Baldrame",
      "Concreto Usinado", "Aço/Ferragem (CA-50, CA-60)",
      "Impermeabilização de Fundação", "Lona Preta", "Formas de Madeira"
    ]
  },
  {
    code: "03",
    name: "Estrutura (Concreto e Metálica)",
    items: [
      "Pilares de Concreto", "Vigas de Concreto", "Laje Maciça",
      "Laje Pré-moldada", "Laje Treliçada", "Estrutura Metálica (Galpão)",
      "Pilares Metálicos", "Tesouras Metálicas", "Escada"
    ]
  },
  {
    code: "04",
    name: "Alvenaria e Fechamento",
    items: [
      "Tijolo Cerâmico", "Bloco de Concreto", "Bloco Celular",
      "Parede de Drywall", "Montantes e Perfis para Drywall",
      "Argamassa de Assentamento", "Vergas e Contravergas"
    ]
  },
  {
    code: "05",
    name: "Cobertura",
    items: [
      "Telha Metálica/Zinco (Galpão)", "Telha Termoacústica (Sanduíche)",
      "Telha de Fibrocimento", "Telha Cerâmica", "Madeiramento para Telhado",
      "Calhas", "Rufos", "Impermeabilização de Laje"
    ]
  },
  {
    code: "06",
    name: "Esquadrias e Vidros",
    items: [
      "Porta de Madeira", "Porta de Alumínio", "Porta de Vidro (Blindex)",
      "Janela de Alumínio", "Janela de Vidro Temperado",
      "Portão Metálico de Enrolar (Galpão)", "Fechaduras", "Dobradiças"
    ]
  },
  {
    code: "07",
    name: "Instalações Hidrossanitárias",
    items: [
      "Tubo PVC (Esgoto e Água Fria)", "Tubo CPVC (Água Quente)",
      "Conexões em geral", "Caixa d'Água", "Caixa de Gordura",
      "Ralo Sifonado", "Vaso Sanitário", "Pia/Lavatório",
      "Torneiras", "Registros", "Sifão", "Chuveiro"
    ]
  },
  {
    code: "08",
    name: "Instalações Elétricas",
    items: [
      "Padrão de Entrada de Energia", "Eletrodutos",
      "Eletrocalhas (Galpão/Comercial)", "Fios e Cabos Elétricos",
      "Disjuntores", "Quadro de Distribuição (QDC)",
      "Tomadas", "Interruptores", "Lâmpadas LED", "Luminárias", "Refletores"
    ]
  },
  {
    code: "09",
    name: "Revestimentos",
    items: [
      "Chapisco", "Emboço/Reboco", "Contrapiso", "Porcelanato",
      "Cerâmica", "Piso Vinílico", "Piso Laminado", "Rodapé",
      "Argamassa Colante (AC1, AC2, AC3)", "Rejunte",
      "Bancadas de Granito/Mármore"
    ]
  },
  {
    code: "10",
    name: "Forro e Pintura",
    items: [
      "Forro de Gesso Acartonado", "Sanca de Gesso", "Fundo Preparador",
      "Massa Corrida (Interna)", "Massa Acrílica (Externa)",
      "Tinta Acrílica", "Tinta Látex", "Esmalte Sintético",
      "Tinta Epóxi (Piso de Galpão)"
    ]
  },
  {
    code: "11",
    name: "Climatização e Prevenção",
    items: [
      "Ar-condicionado (Infraestrutura e Aparelhos)", "Tubulação de Cobre",
      "Sistema de Combate a Incêndio (Hidrantes, Extintores, Sprinklers)"
    ]
  },
  {
    code: "12",
    name: "Acabamentos Finais e Diversos",
    items: [
      "Limpeza Pós-obra", "Paisagismo (Grama, Plantas)",
      "Piso Intertravado (Paver)", "Asfalto (Estacionamento)",
      "Portão Eletrônico", "Interfone/Câmeras de Segurança",
      "Equipamentos de Proteção Individual (EPI)"
    ]
  }
];

console.log("Seeding supply categories and items...");

for (const cat of categories) {
  // Check if category already exists
  const existing = await sql`SELECT id FROM supply_categories WHERE code = ${cat.code}`;
  
  let categoryId;
  if (existing.length > 0) {
    categoryId = existing[0].id;
    console.log(`Category ${cat.code} already exists (id: ${categoryId})`);
  } else {
    const [result] = await sql`INSERT INTO supply_categories (code, name) VALUES (${cat.code}, ${cat.name}) RETURNING id`;
    categoryId = result.id;
    console.log(`Created category ${cat.code}: ${cat.name} (id: ${categoryId})`);
  }

  for (const itemName of cat.items) {
    const existingItem = await sql`SELECT id FROM supply_items WHERE category_id = ${categoryId} AND name = ${itemName}`;
    
    if (existingItem.length === 0) {
      await sql`INSERT INTO supply_items (category_id, name) VALUES (${categoryId}, ${itemName})`;
    }
  }
  console.log(`  → ${cat.items.length} items for ${cat.name}`);
}

console.log("Seed complete!");
await sql.end();
process.exit(0);
