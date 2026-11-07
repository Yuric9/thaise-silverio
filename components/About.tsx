const highlights = [
  { value: "6 anos", label: "de especialização em micropigmentação" },
  { value: "Esteticista", label: "e cosmetóloga" },
  { value: "Cursos", label: "para formar novas profissionais" },
];

export default function About() {
  return (
    <section className="intro section" id="sobre">
      <div className="section-label">01 / SOBRE</div>
      <div className="intro-main">
        <p className="eyebrow">UM OLHAR ATENTO A CADA DETALHE</p>
        <h2>
          Beleza não é transformar quem você é. É <em>revelar sua essência.</em>
        </h2>
        <div className="bio">
          <p>
            Olá, sou <strong>Thaise Silvério</strong>, esteticista e
            cosmetóloga, especialista em micropigmentação há 6 anos.
          </p>
          <p>
            Cada atendimento começa com uma escuta atenta: entender o que você
            deseja, respeitar os seus traços e escolher a técnica certa para um
            resultado natural e harmonioso, que combine com quem você é.
          </p>
          <p>
            Deixo aqui todo o meu comprometimento, carinho e cuidado com cada
            cliente. Para mim, realçar a sua beleza é também cuidar da sua
            autoestima e da confiança que você deposita no meu trabalho.
          </p>
          <p className="bio-signature">Thaise Silvério</p>
        </div>
      </div>
      <div className="intro-aside">
        <dl className="highlights">
          {highlights.map((h) => (
            <div key={h.value}>
              <dt>{h.value}</dt>
              <dd>{h.label}</dd>
            </div>
          ))}
        </dl>
        <a className="text-link" href="#contato">
          Vamos conversar <span>→</span>
        </a>
      </div>
    </section>
  );
}
