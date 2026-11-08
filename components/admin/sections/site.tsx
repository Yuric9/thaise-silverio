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
import {
  FAQ_SUGGESTIONS,
  type ContactContent,
  type FaqItem,
  type GalleryItem,
  type Highlight,
  type SiteContent,
  type TextsContent,
} from "../../../lib/site-content";
import { Button } from "../../ui/button";
import { Alert, AsyncContent, EmptyState } from "../../ui/feedback";
import { CheckboxField, TextAreaField, TextField } from "../../ui/field";
import { Badge, PageHeader, Panel, Tabs } from "../../ui/layout";
import { Modal } from "../../ui/modal";

type SiteData = { content: SiteContent; gallery: GalleryItem[] };
type Tab = "textos" | "galeria" | "destaques" | "duvidas" | "contatos";

/** Tela "Site": edita o que aparece na página pública, sem mexer em código. */
export default function SiteSection() {
  const site = useApi<SiteData>("/api/site");
  const [tab, setTab] = useState<Tab>("textos");

  return (
    <>
      <PageHeader
        eyebrow="Site"
        title="Conteúdo do site"
        description="O que você salvar aqui aparece no site na hora."
        actions={
          <a
            className="button button--secondary button--md"
            href="/"
            target="_blank"
            rel="noreferrer"
          >
            <span>Ver o site</span>
          </a>
        }
      />
      <Tabs
        label="Partes do site"
        value={tab}
        onChange={setTab}
        items={[
          { value: "textos", label: "Textos e biografia" },
          {
            value: "galeria",
            label: "Galeria",
            count: site.data?.gallery.length,
          },
          { value: "destaques", label: "Destaques" },
          {
            value: "duvidas",
            label: "Perguntas frequentes",
            count: site.data?.content.faq.length,
          },
          { value: "contatos", label: "Contatos" },
        ]}
      />
      <AsyncContent {...site} onRetry={site.reload}>
        {({ content, gallery }) => (
          <div className="stack">
            {tab === "textos" && (
              <TextsForm
                key={JSON.stringify(content.texts)}
                texts={content.texts}
              />
            )}
            {tab === "galeria" && <GalleryPanel gallery={gallery} />}
            {tab === "destaques" && (
              <HighlightsForm
                key={JSON.stringify(content.highlights)}
                highlights={content.highlights}
              />
            )}
            {tab === "duvidas" && (
              <FaqForm key={JSON.stringify(content.faq)} items={content.faq} />
            )}
            {tab === "contatos" && (
              <ContactForm
                key={JSON.stringify(content.contact)}
                contact={content.contact}
              />
            )}
          </div>
        )}
      </AsyncContent>
    </>
  );
}

function useSaveContent() {
  const { busy, run } = useAction();
  const save = (key: keyof SiteContent, value: unknown) =>
    run(() => api("/api/site", { method: "PUT", body: { key, value } }), {
      success: "Salvo! O site já foi atualizado.",
      refresh: REFRESH.site,
    });
  return { busy, save };
}

// ─── Textos ──────────────────────────────────────────────────────────────────

function TextsForm({ texts }: { texts: TextsContent }) {
  const { busy, save } = useSaveContent();
  const [form, setForm] = useState(texts);
  const set =
    (field: keyof TextsContent) => (event: { target: { value: string } }) =>
      setForm({ ...form, [field]: event.target.value });

  function submit(event: FormEvent) {
    event.preventDefault();
    save("texts", {
      ...form,
      bio: form.bio.map((paragraph) => paragraph.trim()).filter(Boolean),
    });
  }

  return (
    <form onSubmit={submit} className="stack">
      <Alert tone="info">
        Dica: escreva <strong>*palavras*</strong> entre asteriscos para destacar
        em itálico rosé, e <strong>**palavras**</strong> com dois asteriscos
        para negrito.
      </Alert>
      <Panel title="Topo e Sobre">
        <div className="form-grid">
          <TextAreaField
            className="form-grid__full"
            label="Frase do topo (abaixo de “Sua beleza, em sua melhor versão.”)"
            maxLength={300}
            value={form.heroText}
            onChange={set("heroText")}
          />
          <TextField
            className="form-grid__full"
            label="Título do Sobre"
            maxLength={160}
            value={form.aboutHeading}
            onChange={set("aboutHeading")}
          />
        </div>
      </Panel>

      <Panel title="Biografia">
        <div className="form-grid">
          {form.bio.map((paragraph, index) => (
            <div key={index} className="form-grid__full">
              <TextAreaField
                label={`Parágrafo ${index + 1}`}
                rows={4}
                maxLength={900}
                value={paragraph}
                onChange={(event) =>
                  setForm({
                    ...form,
                    bio: form.bio.map((item, position) =>
                      position === index ? event.target.value : item,
                    ),
                  })
                }
              />
              {form.bio.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon="trash"
                  onClick={() =>
                    setForm({
                      ...form,
                      bio: form.bio.filter((_, position) => position !== index),
                    })
                  }
                >
                  Remover parágrafo
                </Button>
              )}
            </div>
          ))}
          {form.bio.length < 6 && (
            <Button
              variant="secondary"
              size="sm"
              icon="plus"
              onClick={() => setForm({ ...form, bio: [...form.bio, ""] })}
            >
              Adicionar parágrafo
            </Button>
          )}
          <TextField
            label="Assinatura"
            maxLength={60}
            value={form.signature}
            onChange={set("signature")}
          />
        </div>
      </Panel>

      <Panel title="Textos das seções">
        <div className="form-grid">
          <TextAreaField
            className="form-grid__full"
            label="Procedimentos"
            maxLength={300}
            value={form.servicesIntro}
            onChange={set("servicesIntro")}
          />
          <TextAreaField
            className="form-grid__full"
            label="Antes & depois"
            maxLength={300}
            value={form.resultsIntro}
            onChange={set("resultsIntro")}
          />
          <TextAreaField
            className="form-grid__full"
            label="Cursos"
            maxLength={400}
            value={form.coursesText}
            onChange={set("coursesText")}
          />
          <TextAreaField
            className="form-grid__full"
            label="Contato"
            maxLength={300}
            value={form.contactText}
            onChange={set("contactText")}
          />
        </div>
      </Panel>

      <div className="form-actions">
        <Button type="submit" icon="check" loading={busy}>
          Salvar textos
        </Button>
      </div>
    </form>
  );
}

// ─── Destaques ───────────────────────────────────────────────────────────────

function HighlightsForm({ highlights }: { highlights: Highlight[] }) {
  const { busy, save } = useSaveContent();
  const [items, setItems] = useState(highlights);
  const update = (index: number, field: keyof Highlight, value: string) =>
    setItems(
      items.map((item, position) =>
        position === index ? { ...item, [field]: value } : item,
      ),
    );

  function submit(event: FormEvent) {
    event.preventDefault();
    save("highlights", items);
  }

  return (
    <form onSubmit={submit}>
      <Panel
        title="Destaques ao lado da biografia"
        eyebrow="Ex.: +500 · clientes atendidas"
      >
        <div className="stack">
          {items.map((item, index) => (
            <div key={index} className="form-grid">
              <TextField
                label={`Destaque ${index + 1}`}
                maxLength={30}
                value={item.value}
                onChange={(event) => update(index, "value", event.target.value)}
              />
              <TextField
                label="Descrição"
                maxLength={80}
                value={item.label}
                onChange={(event) => update(index, "label", event.target.value)}
              />
              {items.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon="trash"
                  onClick={() =>
                    setItems(items.filter((_, position) => position !== index))
                  }
                >
                  Remover
                </Button>
              )}
            </div>
          ))}
          <div className="form-actions">
            {items.length < 6 && (
              <Button
                variant="secondary"
                icon="plus"
                onClick={() => setItems([...items, { value: "", label: "" }])}
              >
                Adicionar destaque
              </Button>
            )}
            <Button type="submit" icon="check" loading={busy}>
              Salvar destaques
            </Button>
          </div>
        </div>
      </Panel>
    </form>
  );
}

// ─── Perguntas frequentes ────────────────────────────────────────────────────

function FaqForm({ items: initial }: { items: FaqItem[] }) {
  const { busy, save } = useSaveContent();
  const [items, setItems] = useState(initial);
  const update = (index: number, field: keyof FaqItem, value: string) =>
    setItems(
      items.map((item, position) =>
        position === index ? { ...item, [field]: value } : item,
      ),
    );
  const move = (index: number, step: number) => {
    const target = index + step;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
  };
  const unused = FAQ_SUGGESTIONS.filter(
    (question) => !items.some((item) => item.question === question),
  );

  function submit(event: FormEvent) {
    event.preventDefault();
    save(
      "faq",
      items.map((item) => ({
        question: item.question.trim(),
        answer: item.answer.trim(),
      })),
    );
  }

  return (
    <form onSubmit={submit} className="stack">
      <Alert tone="info">
        A seção “Perguntas frequentes” só aparece no site quando houver pelo
        menos uma pergunta salva. Escreva as respostas com as suas palavras: são
        informações sobre o procedimento e a saúde das clientes.
      </Alert>
      <Panel title="Perguntas e respostas" eyebrow={`${items.length} de 12`}>
        <div className="stack">
          {items.length === 0 && (
            <p className="muted">
              Nenhuma pergunta ainda. Use as sugestões abaixo ou escreva a sua.
            </p>
          )}
          {items.map((item, index) => (
            <div key={index} className="form-grid faq-admin__item">
              <TextField
                className="form-grid__full"
                label={`Pergunta ${index + 1}`}
                maxLength={160}
                value={item.question}
                onChange={(event) =>
                  update(index, "question", event.target.value)
                }
              />
              <TextAreaField
                className="form-grid__full"
                label="Resposta"
                rows={4}
                maxLength={800}
                placeholder="Escreva a resposta com as suas palavras."
                value={item.answer}
                onChange={(event) =>
                  update(index, "answer", event.target.value)
                }
              />
              <div className="form-grid__full gallery-admin__actions">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                >
                  ↑ Subir
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={index === items.length - 1}
                  onClick={() => move(index, 1)}
                >
                  ↓ Descer
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  icon="trash"
                  onClick={() =>
                    setItems(items.filter((_, position) => position !== index))
                  }
                >
                  Remover
                </Button>
              </div>
            </div>
          ))}
          {items.length < 12 && (
            <div className="stack">
              {unused.length > 0 && (
                <div>
                  <p className="muted">
                    Sugestões de perguntas (a resposta é você quem escreve):
                  </p>
                  <div className="gallery-admin__actions">
                    {unused.map((question) => (
                      <Button
                        key={question}
                        variant="secondary"
                        size="sm"
                        icon="plus"
                        onClick={() =>
                          setItems([...items, { question, answer: "" }])
                        }
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <Button
                  variant="secondary"
                  icon="plus"
                  onClick={() =>
                    setItems([...items, { question: "", answer: "" }])
                  }
                >
                  Escrever outra pergunta
                </Button>
              </div>
            </div>
          )}
          <div className="form-actions">
            <Button type="submit" icon="check" loading={busy}>
              Salvar perguntas
            </Button>
          </div>
        </div>
      </Panel>
    </form>
  );
}

// ─── Contatos ────────────────────────────────────────────────────────────────

function ContactForm({ contact }: { contact: ContactContent }) {
  const { busy, save } = useSaveContent();
  const [form, setForm] = useState(contact);

  function submit(event: FormEvent) {
    event.preventDefault();
    save("contact", {
      ...form,
      whatsappNumber: form.whatsappNumber.replace(/\D/g, ""),
    });
  }

  return (
    <form onSubmit={submit}>
      <Panel
        title="WhatsApp e Instagram"
        eyebrow="Usados em todos os botões do site"
      >
        <div className="form-grid">
          <TextField
            label="WhatsApp (só números)"
            inputMode="numeric"
            hint="Comece com 55 e o DDD. Ex.: 5562981231427"
            value={form.whatsappNumber}
            onChange={(event) =>
              setForm({ ...form, whatsappNumber: event.target.value })
            }
          />
          <TextField
            label="WhatsApp como aparece no site"
            hint="Ex.: (62) 98123-1427"
            maxLength={40}
            value={form.whatsappDisplay}
            onChange={(event) =>
              setForm({ ...form, whatsappDisplay: event.target.value })
            }
          />
          <TextField
            label="Instagram (sem @)"
            maxLength={31}
            value={form.instagramHandle}
            onChange={(event) =>
              setForm({ ...form, instagramHandle: event.target.value })
            }
          />
          <div className="form-grid__full">
            <a
              className="button button--ghost button--sm"
              href={`https://wa.me/${form.whatsappNumber.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
            >
              <span>Testar o link do WhatsApp</span>
            </a>
          </div>
        </div>
        <div className="form-actions">
          <Button type="submit" icon="check" loading={busy}>
            Salvar contatos
          </Button>
        </div>
      </Panel>
    </form>
  );
}

// ─── Galeria ─────────────────────────────────────────────────────────────────

function GalleryPanel({ gallery }: { gallery: GalleryItem[] }) {
  const [editing, setEditing] = useState<GalleryItem | "new" | null>(null);
  const { busy, run } = useAction();

  const toggle = (item: GalleryItem) =>
    run(
      () =>
        api(`/api/gallery/${item.id}`, {
          method: "PATCH",
          body: { active: !item.active },
        }),
      {
        success: item.active
          ? "Foto ocultada do site."
          : "Foto publicada no site.",
        refresh: REFRESH.site,
      },
    );

  return (
    <Panel
      title="Galeria “Antes & depois”"
      eyebrow="Fotos com autorização das clientes"
      actions={
        <Button icon="upload" onClick={() => setEditing("new")}>
          Adicionar foto
        </Button>
      }
    >
      {gallery.length ? (
        <ul className="gallery-admin">
          {gallery.map((item) => (
            <li key={item.id} className={item.active ? "" : "is-muted"}>
              <img
                src={imageUrl(item.imageKey)}
                alt={item.alt}
                loading="lazy"
                width={item.width}
                height={item.height}
              />
              <div className="gallery-admin__body">
                <strong>{item.title}</strong>
                <span>
                  <Badge tone="gold">{item.tag}</Badge>{" "}
                  <Badge tone={item.active ? "success" : "neutral"}>
                    {item.active ? "No site" : "Oculta"}
                  </Badge>
                </span>
                <div className="gallery-admin__actions">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="edit"
                    onClick={() => setEditing(item)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={busy}
                    onClick={() => toggle(item)}
                  >
                    {item.active ? "Ocultar" : "Mostrar"}
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState icon="image" title="Nenhuma foto na galeria">
          Quando não há fotos, a seção “Antes & depois” não aparece no site.
        </EmptyState>
      )}
      {editing && (
        <GalleryModal
          key={editing === "new" ? "new" : editing.id}
          item={editing === "new" ? null : editing}
          nextOrder={gallery.length + 1}
          onClose={() => setEditing(null)}
        />
      )}
    </Panel>
  );
}

function GalleryModal({
  item,
  nextOrder,
  onClose,
}: {
  item: GalleryItem | null;
  nextOrder: number;
  onClose: () => void;
}) {
  const { busy, run } = useAction();
  const fileInput = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(item ? imageUrl(item.imageKey) : "");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [form, setForm] = useState({
    title: item?.title ?? "",
    tag: item?.tag ?? "Antes e depois",
    alt: item?.alt ?? "",
    sortOrder: String(item?.sortOrder ?? nextOrder),
    active: item?.active ?? true,
    authorized: Boolean(item),
  });

  function choose(selected: File | undefined) {
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  async function submit() {
    const fields = {
      title: form.title,
      tag: form.tag,
      alt: form.alt,
      sortOrder: Number(form.sortOrder),
      active: form.active,
    };
    const done = await run(
      async () => {
        if (item)
          return api(`/api/gallery/${item.id}`, {
            method: "PATCH",
            body: fields,
          });
        if (!file) throw new Error("Escolha a foto.");
        const uploaded = await uploadGalleryImage(file);
        return api("/api/gallery", {
          method: "POST",
          body: {
            ...fields,
            imageKey: uploaded.key,
            width: uploaded.width || 1000,
            height: uploaded.height || 1000,
          },
        });
      },
      {
        success: item ? "Foto atualizada." : "Foto adicionada ao site.",
        refresh: REFRESH.site,
      },
    );
    if (done) onClose();
  }

  async function remove() {
    if (!item) return;
    const done = await run(
      () => api(`/api/gallery/${item.id}`, { method: "DELETE" }),
      { success: "Foto removida.", refresh: REFRESH.site },
    );
    if (done) onClose();
  }

  const ready =
    form.title.trim() &&
    form.alt.trim().length >= 10 &&
    (item || (file && form.authorized));

  return (
    <Modal
      open
      size="lg"
      title={item ? "Editar foto" : "Adicionar foto"}
      description={
        item
          ? undefined
          : "A foto é reduzida e os dados de localização do celular são apagados antes do envio."
      }
      onClose={onClose}
      onSubmit={submit}
      footer={
        <>
          {item &&
            (confirmDelete ? (
              <Button
                variant="danger"
                icon="trash"
                loading={busy}
                onClick={remove}
              >
                Confirmar exclusão
              </Button>
            ) : (
              <Button
                variant="ghost"
                icon="trash"
                onClick={() => setConfirmDelete(true)}
              >
                Excluir
              </Button>
            ))}
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={busy} disabled={!ready}>
            Salvar
          </Button>
        </>
      }
    >
      <div className="form-grid">
        <div className="form-grid__full gallery-upload">
          {preview ? (
            <img src={preview} alt="" />
          ) : (
            <span className="muted">Nenhuma foto escolhida</span>
          )}
          {!item && (
            <>
              <input
                ref={fileInput}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                onChange={(event) => choose(event.target.files?.[0])}
              />
              <Button
                variant="secondary"
                icon="upload"
                onClick={() => fileInput.current?.click()}
              >
                {file ? "Trocar foto" : "Escolher foto"}
              </Button>
            </>
          )}
        </div>
        <TextField
          label="Título"
          placeholder="Ex.: Micropigmentação labial"
          maxLength={80}
          required
          value={form.title}
          onChange={(event) => setForm({ ...form, title: event.target.value })}
        />
        <TextField
          label="Etiqueta"
          maxLength={30}
          required
          value={form.tag}
          onChange={(event) => setForm({ ...form, tag: event.target.value })}
        />
        <TextAreaField
          className="form-grid__full"
          label="Descrição da foto"
          hint="O que aparece na foto, para quem usa leitor de tela e para o Google. Ex.: Lábios antes e depois da micropigmentação, com cor mais viva."
          maxLength={240}
          required
          value={form.alt}
          onChange={(event) => setForm({ ...form, alt: event.target.value })}
        />
        <TextField
          label="Ordem na galeria"
          type="number"
          min={0}
          max={999}
          value={form.sortOrder}
          onChange={(event) =>
            setForm({ ...form, sortOrder: event.target.value })
          }
        />
        <CheckboxField
          label="Mostrar no site"
          checked={form.active}
          onChange={(event) =>
            setForm({ ...form, active: event.target.checked })
          }
        />
        {!item && (
          <CheckboxField
            className="form-grid__full"
            label="A cliente autorizou o uso desta foto no site."
            checked={form.authorized}
            onChange={(event) =>
              setForm({ ...form, authorized: event.target.checked })
            }
          />
        )}
      </div>
    </Modal>
  );
}
