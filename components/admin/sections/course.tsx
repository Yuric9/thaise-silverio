"use client";

import { useRef, useState, type FormEvent } from "react";
import {
  api,
  imageUrl,
  uploadGalleryImage,
  useApi,
} from "../../../lib/client/api";
import { REFRESH } from "../../../lib/client/refresh";
import { useAction } from "../../../lib/client/use-action";
import type {
  CourseContent,
  CoursePhoto,
  FaqItem,
  SiteContent,
  TitledItem,
} from "../../../lib/site-content";
import { Button } from "../../ui/button";
import { Alert, AsyncContent } from "../../ui/feedback";
import { CheckboxField, TextAreaField, TextField } from "../../ui/field";
import { PageHeader, Panel } from "../../ui/layout";

/** Títulos sugeridos para "Como funciona" (o texto é a Thaise quem escreve). */
const DETAIL_SUGGESTIONS = [
  "Formato",
  "Carga horária",
  "Turmas",
  "Local",
  "Pré-requisitos",
  "Certificado",
];

/** Tela "Curso": a página de vendas do curso (/curso), editada sem código. */
export default function CourseSection() {
  const site = useApi<{ content: SiteContent }>("/api/site");
  return (
    <>
      <PageHeader
        eyebrow="Site"
        title="Página do curso"
        description="A página de vendas do Curso de Micropigmentação de Sobrancelhas. Cada parte só aparece no site quando estiver preenchida."
      />
      <AsyncContent {...site} onRetry={site.reload}>
        {({ content }) => (
          <CourseForm
            key={JSON.stringify(content.course)}
            initial={content.course}
          />
        )}
      </AsyncContent>
    </>
  );
}

function CourseForm({ initial }: { initial: CourseContent }) {
  const { busy, run } = useAction();
  const [course, setCourse] = useState(initial);
  const set = <K extends keyof CourseContent>(
    key: K,
    value: CourseContent[K],
  ) => setCourse({ ...course, [key]: value });

  function submit(event: FormEvent) {
    event.preventDefault();
    run(
      () =>
        api("/api/site", {
          method: "PUT",
          body: { key: "course", value: course },
        }),
      {
        success: course.published
          ? "Salvo! A página do curso já está no ar."
          : "Salvo como rascunho (a página ainda não está publicada).",
        refresh: REFRESH.site,
      },
    );
  }

  const empty =
    !course.audience.length &&
    !course.modules.length &&
    !course.details.length &&
    !course.includes.length;

  return (
    <form onSubmit={submit} className="stack">
      <Panel title="Publicação">
        <div className="stack">
          <CheckboxField
            label="Publicar a página do curso no site"
            checked={course.published}
            onChange={(event) => set("published", event.target.checked)}
          />
          {course.published && empty && (
            <Alert tone="warning">
              A página está quase vazia. Preencha pelo menos “O que você vai
              aprender” antes de publicar.
            </Alert>
          )}
          <p className="muted">
            Publicada, ela fica em <strong>/curso</strong> e o botão “Conheça o
            curso” da página inicial passa a levar para ela. Sem publicar, o
            botão continua abrindo o WhatsApp.
          </p>
          {initial.published && (
            <a
              className="button button--secondary button--sm"
              href="/curso"
              target="_blank"
              rel="noreferrer"
            >
              <span>Ver a página do curso</span>
            </a>
          )}
        </div>
      </Panel>

      <Panel title="Apresentação">
        <div className="form-grid">
          <TextField
            className="form-grid__full"
            label="Nome do curso"
            maxLength={120}
            value={course.title}
            onChange={(event) => set("title", event.target.value)}
          />
          <TextAreaField
            className="form-grid__full"
            label="Frase de apresentação"
            maxLength={400}
            value={course.subtitle}
            onChange={(event) => set("subtitle", event.target.value)}
          />
        </div>
      </Panel>

      <Panel
        title="Fotos do curso"
        eyebrow="Turma, prática, kit, certificado... (até 12)"
      >
        <CoursePhotos
          photos={course.photos}
          heroPhoto={course.heroPhoto}
          onChange={(photos, heroPhoto) =>
            setCourse({ ...course, photos, heroPhoto })
          }
        />
      </Panel>

      <Panel
        title="Para quem é"
        eyebrow="Ex.: Iniciantes que querem entrar na área"
      >
        <StringList
          items={course.audience}
          onChange={(items) => set("audience", items)}
          max={10}
          placeholder="Para quem é este curso?"
          addLabel="Adicionar item"
        />
      </Panel>

      <Panel
        title="O que você vai aprender"
        eyebrow="Módulos ou temas do curso"
      >
        <TitledList
          items={course.modules}
          onChange={(items) => set("modules", items)}
          titleLabel="Módulo"
          textLabel="Descrição (opcional)"
          addLabel="Adicionar módulo"
        />
      </Panel>

      <Panel
        title="Como funciona"
        eyebrow="Formato, carga horária, turmas, local..."
      >
        <TitledList
          items={course.details}
          onChange={(items) => set("details", items)}
          titleLabel="Item"
          textLabel="Informação"
          addLabel="Adicionar informação"
          suggestions={DETAIL_SUGGESTIONS}
        />
      </Panel>

      <Panel title="O que está incluso" eyebrow="Material, kit, certificado...">
        <StringList
          items={course.includes}
          onChange={(items) => set("includes", items)}
          max={12}
          placeholder="O que a aluna recebe?"
          addLabel="Adicionar item"
        />
      </Panel>

      <Panel
        title="Investimento"
        eyebrow="Deixe o preço em branco para não mostrar"
      >
        <div className="form-grid">
          <TextField
            label="Preço"
            placeholder="Ex.: R$ 1.500"
            maxLength={40}
            value={course.price}
            onChange={(event) => set("price", event.target.value)}
          />
          <TextField
            label="Condições"
            placeholder="Ex.: em até 10x no cartão"
            maxLength={160}
            value={course.priceNote}
            onChange={(event) => set("priceNote", event.target.value)}
          />
          <TextAreaField
            className="form-grid__full"
            label="Mensagem do botão “Quero me inscrever” (WhatsApp)"
            maxLength={300}
            value={course.ctaMessage}
            onChange={(event) => set("ctaMessage", event.target.value)}
          />
        </div>
      </Panel>

      <Panel
        title="Dúvidas sobre o curso"
        eyebrow="Perguntas e respostas (opcional)"
      >
        <FaqList items={course.faq} onChange={(items) => set("faq", items)} />
      </Panel>

      <div className="form-actions">
        <Button type="submit" icon="check" loading={busy}>
          {course.published ? "Salvar e publicar" : "Salvar rascunho"}
        </Button>
      </div>
    </form>
  );
}

function StringList({
  items,
  onChange,
  max,
  placeholder,
  addLabel,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  max: number;
  placeholder: string;
  addLabel: string;
}) {
  return (
    <div className="stack">
      {items.map((item, index) => (
        <div key={index} className="course-admin__row">
          <TextField
            label={`Item ${index + 1}`}
            placeholder={placeholder}
            maxLength={200}
            value={item}
            onChange={(event) =>
              onChange(
                items.map((value, position) =>
                  position === index ? event.target.value : value,
                ),
              )
            }
          />
          <Button
            variant="ghost"
            size="sm"
            icon="trash"
            onClick={() =>
              onChange(items.filter((_, position) => position !== index))
            }
          >
            Remover
          </Button>
        </div>
      ))}
      {items.length < max && (
        <div>
          <Button
            variant="secondary"
            size="sm"
            icon="plus"
            onClick={() => onChange([...items, ""])}
          >
            {addLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

function TitledList({
  items,
  onChange,
  titleLabel,
  textLabel,
  addLabel,
  suggestions = [],
}: {
  items: TitledItem[];
  onChange: (items: TitledItem[]) => void;
  titleLabel: string;
  textLabel: string;
  addLabel: string;
  suggestions?: string[];
}) {
  const update = (index: number, field: keyof TitledItem, value: string) =>
    onChange(
      items.map((item, position) =>
        position === index ? { ...item, [field]: value } : item,
      ),
    );
  const unused = suggestions.filter(
    (title) => !items.some((item) => item.title === title),
  );
  return (
    <div className="stack">
      {items.map((item, index) => (
        <div key={index} className="form-grid faq-admin__item">
          <TextField
            label={`${titleLabel} ${index + 1}`}
            maxLength={120}
            value={item.title}
            onChange={(event) => update(index, "title", event.target.value)}
          />
          <TextAreaField
            label={textLabel}
            rows={2}
            maxLength={600}
            value={item.text}
            onChange={(event) => update(index, "text", event.target.value)}
          />
          <div className="form-grid__full">
            <Button
              variant="ghost"
              size="sm"
              icon="trash"
              onClick={() =>
                onChange(items.filter((_, position) => position !== index))
              }
            >
              Remover
            </Button>
          </div>
        </div>
      ))}
      {items.length < 12 && (
        <div className="gallery-admin__actions">
          {unused.map((title) => (
            <Button
              key={title}
              variant="secondary"
              size="sm"
              icon="plus"
              onClick={() => onChange([...items, { title, text: "" }])}
            >
              {title}
            </Button>
          ))}
          <Button
            variant="secondary"
            size="sm"
            icon="plus"
            onClick={() => onChange([...items, { title: "", text: "" }])}
          >
            {addLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

function FaqList({
  items,
  onChange,
}: {
  items: FaqItem[];
  onChange: (items: FaqItem[]) => void;
}) {
  const update = (index: number, field: keyof FaqItem, value: string) =>
    onChange(
      items.map((item, position) =>
        position === index ? { ...item, [field]: value } : item,
      ),
    );
  return (
    <div className="stack">
      {items.map((item, index) => (
        <div key={index} className="form-grid faq-admin__item">
          <TextField
            className="form-grid__full"
            label={`Pergunta ${index + 1}`}
            maxLength={160}
            value={item.question}
            onChange={(event) => update(index, "question", event.target.value)}
          />
          <TextAreaField
            className="form-grid__full"
            label="Resposta"
            rows={3}
            maxLength={800}
            value={item.answer}
            onChange={(event) => update(index, "answer", event.target.value)}
          />
          <div className="form-grid__full">
            <Button
              variant="ghost"
              size="sm"
              icon="trash"
              onClick={() =>
                onChange(items.filter((_, position) => position !== index))
              }
            >
              Remover
            </Button>
          </div>
        </div>
      ))}
      {items.length < 12 && (
        <div>
          <Button
            variant="secondary"
            size="sm"
            icon="plus"
            onClick={() => onChange([...items, { question: "", answer: "" }])}
          >
            Adicionar pergunta
          </Button>
        </div>
      )}
    </div>
  );
}

const MAX_PHOTOS = 12;

/**
 * Fotos do curso: a foto é enviada na hora (já reduzida, em WebP e sem dados
 * de localização), mas só aparece no site depois de clicar em Salvar.
 */
function CoursePhotos({
  photos,
  heroPhoto,
  onChange,
}: {
  photos: CoursePhoto[];
  heroPhoto: string;
  onChange: (photos: CoursePhoto[], heroPhoto: string) => void;
}) {
  const { busy, run } = useAction();
  const fileInput = useRef<HTMLInputElement>(null);
  const [authorized, setAuthorized] = useState(photos.length > 0);

  async function add(files: FileList | null) {
    const chosen = Array.from(files ?? []).slice(0, MAX_PHOTOS - photos.length);
    if (!chosen.length) return;
    const uploaded = await run(
      () =>
        Promise.all(
          chosen.map(async (file) => {
            const result = await uploadGalleryImage(file, "course");
            return {
              key: result.key,
              alt: "",
              caption: "",
              width: result.width || 1000,
              height: result.height || 1000,
            } satisfies CoursePhoto;
          }),
        ),
      {
        success:
          "Foto enviada! Escreva a descrição e clique em Salvar para ela aparecer no site.",
      },
    );
    if (fileInput.current) fileInput.current.value = "";
    if (uploaded) onChange([...photos, ...uploaded], heroPhoto);
  }

  const update = (key: string, field: "alt" | "caption", value: string) =>
    onChange(
      photos.map((photo) =>
        photo.key === key ? { ...photo, [field]: value } : photo,
      ),
      heroPhoto,
    );

  return (
    <div className="stack">
      {photos.length > 0 && (
        <ul className="gallery-admin course-photos-admin">
          {photos.map((photo, index) => (
            <li key={photo.key}>
              <img
                src={imageUrl(photo.key)}
                alt={photo.alt || `Foto ${index + 1} do curso`}
                width={photo.width}
                height={photo.height}
                loading="lazy"
              />
              <div className="gallery-admin__body">
                <TextAreaField
                  label="Descrição da foto"
                  hint="Ex.: Aluna praticando o desenho da sobrancelha em modelo"
                  rows={2}
                  maxLength={240}
                  value={photo.alt}
                  onChange={(event) =>
                    update(photo.key, "alt", event.target.value)
                  }
                />
                <TextField
                  label="Legenda (opcional)"
                  maxLength={80}
                  value={photo.caption}
                  onChange={(event) =>
                    update(photo.key, "caption", event.target.value)
                  }
                />
                <CheckboxField
                  label="Usar como foto do topo da página"
                  checked={heroPhoto === photo.key}
                  onChange={(event) =>
                    onChange(photos, event.target.checked ? photo.key : "")
                  }
                />
                <div className="gallery-admin__actions">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="trash"
                    onClick={() =>
                      onChange(
                        photos.filter((item) => item.key !== photo.key),
                        heroPhoto === photo.key ? "" : heroPhoto,
                      )
                    }
                  >
                    Remover
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {photos.length === 0 && (
        <p className="muted">
          Sem fotos, a seção “Por dentro do curso” não aparece e o topo da
          página usa a foto da Thaise.
        </p>
      )}
      {photos.length < MAX_PHOTOS && (
        <div className="stack">
          <CheckboxField
            label="As pessoas que aparecem nas fotos autorizaram o uso da imagem"
            checked={authorized}
            onChange={(event) => setAuthorized(event.target.checked)}
          />
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            hidden
            onChange={(event) => add(event.target.files)}
          />
          <div>
            <Button
              variant="secondary"
              icon="upload"
              loading={busy}
              disabled={!authorized}
              onClick={() => fileInput.current?.click()}
            >
              Adicionar fotos
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
