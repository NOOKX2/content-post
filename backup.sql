--
-- PostgreSQL database cluster dump
--

\restrict zj6Pwfm3TGoHQ6ww2wirk1TExAXEmobIn2HfpobH6uXBNXOzglUp79QQKkWjqz7

SET default_transaction_read_only = off;

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

--
-- Roles
--

CREATE ROLE postgres;
ALTER ROLE postgres WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION BYPASSRLS PASSWORD 'SCRAM-SHA-256$4096:r9V+Wbh02FrCN9YjTYg5ag==$pXckK8nqEhBbbRWuBhzcllaETExIJA8cyJPXln3H2CU=:rCXuU1gcxn+gxs9T2276ccOababkDl+dZPt3HmKMhWk=';

--
-- User Configurations
--








\unrestrict zj6Pwfm3TGoHQ6ww2wirk1TExAXEmobIn2HfpobH6uXBNXOzglUp79QQKkWjqz7

--
-- Databases
--

--
-- Database "template1" dump
--

\connect template1

--
-- PostgreSQL database dump
--

\restrict c2gYDgoT4BU3zNbB5pfbn7mUbFKFFDmPxut9La2eeUoWafxrPa5IvlMnMgR9Lu5

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- PostgreSQL database dump complete
--

\unrestrict c2gYDgoT4BU3zNbB5pfbn7mUbFKFFDmPxut9La2eeUoWafxrPa5IvlMnMgR9Lu5

--
-- Database "content_post" dump
--

--
-- PostgreSQL database dump
--

\restrict oCxopRztL00k39ccmISxMufJfjTPZqdXySSa7tA1ikec9C4WuBZPehe0VnUVq0j

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: content_post; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE content_post WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


ALTER DATABASE content_post OWNER TO postgres;

\unrestrict oCxopRztL00k39ccmISxMufJfjTPZqdXySSa7tA1ikec9C4WuBZPehe0VnUVq0j
\connect content_post
\restrict oCxopRztL00k39ccmISxMufJfjTPZqdXySSa7tA1ikec9C4WuBZPehe0VnUVq0j

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: ContentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ContentStatus" AS ENUM (
    'draft',
    'pending',
    'approved',
    'scheduled',
    'posted',
    'rejected'
);


ALTER TYPE public."ContentStatus" OWNER TO postgres;

--
-- Name: MediaType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."MediaType" AS ENUM (
    'video',
    'image'
);


ALTER TYPE public."MediaType" OWNER TO postgres;

--
-- Name: Platform; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Platform" AS ENUM (
    'facebook',
    'instagram',
    'tiktok',
    'line',
    'lemon8',
    'youtube'
);


ALTER TYPE public."Platform" OWNER TO postgres;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'USER',
    'ADMIN'
);


ALTER TYPE public."Role" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Content; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Content" (
    id text NOT NULL,
    "contentId" text NOT NULL,
    name text NOT NULL,
    "mediaType" public."MediaType" NOT NULL,
    channel text DEFAULT ''::text NOT NULL,
    platforms public."Platform"[],
    details text DEFAULT ''::text NOT NULL,
    location text[] NOT NULL,
    "scheduledDate" text NOT NULL,
    "scheduledTime" text NOT NULL,
    "endTime" text,
    team jsonb DEFAULT '[]'::jsonb NOT NULL,
    "productsNeeded" text[],
    "itemsToPrepare" text DEFAULT ''::text NOT NULL,
    attachments text[],
    script jsonb DEFAULT '[]'::jsonb NOT NULL,
    "ideaCreator" text DEFAULT ''::text NOT NULL,
    photographer text DEFAULT ''::text NOT NULL,
    editor text DEFAULT ''::text NOT NULL,
    approver text,
    status public."ContentStatus" DEFAULT 'pending'::public."ContentStatus" NOT NULL,
    category text DEFAULT ''::text NOT NULL,
    tags text[],
    "createdById" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Content" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    role public."Role" DEFAULT 'USER'::public."Role" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Data for Name: Content; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Content" (id, "contentId", name, "mediaType", channel, platforms, details, location, "scheduledDate", "scheduledTime", "endTime", team, "productsNeeded", "itemsToPrepare", attachments, script, "ideaCreator", photographer, editor, approver, status, category, tags, "createdById", "createdAt", "updatedAt") FROM stdin;
cmr1rufqi00035auii7ehwyie	10001	Hero Serum Launch Video	video	Official	{facebook,instagram,tiktok}	วิดีโอเปิดตัว Hero Serum สไตล์ lifestyle herbal	{"Studio A"}	2026-06-15	10:00	12:00	[{"id": "1", "participant": "Laura Power", "responsibility": "Presenter"}, {"id": "2", "participant": "วิชัย สร้างสรรค์", "responsibility": "Camera"}]	{"Hero Serum"}	Backdrop สีเขียว, Props สมุนไพร	{}	[{"id": "s1", "notes": "Close-up macro", "action": "Open with product shot", "dialogue": "สวัสดีค่ะ วันนี้มาแนะนำ Hero Serum", "duration": "0:00-0:15"}]	Laura Power	พิมพ์ใจ ถ่ายทำ	กนก ตัดต่อ	\N	posted	Hero Video	{"Hero Product"}	cmr0st15o00015ajw016gq5ob	2026-07-01 07:46:09.066	2026-07-01 08:18:30.023
cmr1rufqx00075aui3pbp77di	10003	Gift Set Teaser	image	ของชำร่วย	{instagram,lemon8}	ภาพ Teaser ชุดของขวัญสมุนไพร	{"Studio A"}	2026-06-18	14:00	15:00	[]	{"Gift Set"}	Ribbon, Gift box props	{}	[]	Laura Power	พิมพ์ใจ ถ่ายทำ	กนก ตัดต่อ	Admin	posted	Recap / Teaser	{Gift}	cmr0st15o00015ajw016gq5ob	2026-07-01 07:46:09.081	2026-07-01 09:30:38.68
cmr1rufqt00055aui84y790ed	10002	Farm Fresh Behind the Scenes	video	วังน้ำเขียวฟาร์ม	{facebook,tiktok,line}	Behind the scenes การเก็บเกี่ยวสมุนไพรที่ฟาร์ม	{"Farm Location"}	2026-06-17	09:00	11:00	[{"id": "1", "participant": "มานี มีสุข", "responsibility": "Presenter"}]	{"Herbal Tea Set"}	Outdoor mic, Drone	{}	[]	มานี มีสุข	พิมพ์ใจ ถ่ายทำ	กนก ตัดต่อ	Admin	posted	Behind the Scenes	{Farm}	cmr0st15o00015ajw016gq5ob	2026-07-01 07:46:09.077	2026-07-01 09:30:38.681
cmr1vieqc0001qp6srbw9bth0	15067	gumo	video	สายพี่ป๋อง	{tiktok,instagram}	vegetable gummy bear	{"Studio A"}	2026-07-01	16:28	19:48	[{"id": "f7d225e0-d407-4f5b-8b49-14ffd1dd8f0e", "participant": "Laura Power", "responsibility": "Presenter"}]	{}		{}	[]				Admin	posted	Hero Video	{}	cmr0t4bky00015apc4rn000tc	2026-07-01 09:28:46.357	2026-07-01 09:30:38.681
cmr1wopif0001qpr6tlmak29r	16108	21 training club	video		{}		{}			\N	[]	{}		{}	[]				Admin	approved		{}	cmr0t4bky00015apc4rn000tc	2026-07-01 10:01:39.879	2026-07-01 10:02:21.534
cmr2b79v60009qp6n7yf4su17	15646	six seven content	video		{}		{}	2026-07-15	23:47	23:49	[]	{}		{}	[]				Admin	approved		{}	cmr0t4bky00015apc4rn000tc	2026-07-01 16:48:00.69	2026-07-01 17:58:40.084
cmr2b6irf0007qp6njr9sj273	18673	six seven content	video		{}		{}			\N	[]	{}		{}	[]				Admin	approved		{}	cmr0t4bky00015apc4rn000tc	2026-07-01 16:47:25.563	2026-07-01 17:58:40.887
cmr2b60mx0005qp6nxnkrpdnh	10598	21 training club	video		{}		{}			\N	[]	{}		{}	[]				Admin	approved		{}	cmr0t4bky00015apc4rn000tc	2026-07-01 16:47:02.074	2026-07-01 17:58:41.394
cmr2b04a90001qp6nt7e43h1n	11732	gumo	video		{}	ทายผัก	{}			\N	[]	{}		{/uploads/a986e35a-9dbe-47a5-8887-4edcb7a9869f.pdf}	[]				Admin	approved		{}	cmr0t4bky00015apc4rn000tc	2026-07-01 16:42:26.866	2026-07-01 17:58:42.467
cmr1wxzjf0003qpr6c7l0sj1d	16409	21 training club	video		{}		{}			\N	[]	{}		{}	[]				Admin	approved		{}	cmr0t4bky00015apc4rn000tc	2026-07-01 10:08:52.78	2026-07-01 17:58:43.08
cmr2b23hj0003qp6njixegjpl	10922	21 training club	video		{tiktok,instagram,line}		{}	2026-07-01	06:46	13:45	[]	{}		{}	[]				Admin	posted		{}	cmr0t4bky00015apc4rn000tc	2026-07-01 16:43:59.143	2026-07-01 18:45:39.038
cmr303m3d0001nq6th6jwhswh	10403	21 training club	video	ลูกสาว	{facebook}	21 training club	{"Studio A","Farm Location",Office}	2026-07-02	11:24	16:24	[]	{"Hero Serum","Herbal Tea Set","Farm Fresh Honey"}		{}	[{"id": "2c5d68a1-a2e0-4738-bf62-f46fb6b38bef", "notes": "", "action": "", "dialogue": "", "duration": ""}]	มานี มีสุข	สมชาย ใจดี	สมชาย ใจดี	Admin	approved		{}	cmr0t2o1b00005apcttuncl5n	2026-07-02 04:25:00.314	2026-07-02 05:13:27.388
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, name, email, password, role, "createdAt", "updatedAt") FROM stdin;
cmr0st15o00015ajw016gq5ob	Creator Demo	creator@idea.local	$argon2id$v=19$m=65536,t=3,p=4$IcsJwq3V8uBKR1h6f0pK8Q$KkopTjUuF6//vnRAXAjBR3RLpC7BOIPOhWHUybJMoJY	USER	2026-06-30 15:25:16.957	2026-06-30 15:25:16.957
cmr0t4bky00015apc4rn000tc	test	test@gmail.com	$argon2id$v=19$m=65536,t=3,p=4$vhxypuwJ7d42h1zj1xcuHw$aU8UaPuC4OeInCLLbxERPJq7XU/WTLDZoLsJkrDtnPk	USER	2026-06-30 15:34:03.682	2026-06-30 15:34:03.682
cmr1rufpx00005auif1qllqar	Admin	admin@idea.local	$argon2id$v=19$m=65536,t=3,p=4$Bob7ECXJ3dix+lcpzsGYNg$RGRvrL8QcjeNvAwbraiOCOCFHFMH+rU1Wk3bpOLdIro	ADMIN	2026-07-01 07:46:09.045	2026-07-01 07:46:09.045
cmr0t2o1b00005apcttuncl5n	Nook	nook@gmail.com	$argon2id$v=19$m=65536,t=3,p=4$1SBeOIKwc6EWdSvpwVAW7g$CEAS9ERARaLobqTadUlIhiRF+e7Tc9qp+1BNBwsbVpo	USER	2026-06-30 15:32:46.511	2026-07-02 04:23:41.207
cmr0st15a00005ajw5330erge	Admin	admin@gmail.com	$argon2id$v=19$m=65536,t=3,p=4$OLEJ6N6MBjf+AWsTMamXsQ$kOv/5xULBYDSba/59KojRkweeCbuP10UW9LYq84o2/Q	ADMIN	2026-06-30 15:25:16.942	2026-07-02 04:26:08.919
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
1745cf27-5625-401c-b504-f7ddff53ca49	7aedae46f69d3c37a8f0a04f54fca59a7faecfd2405d662079d6f2cc58214aa9	2026-06-30 15:25:15.984729+00	20260630152515_init	\N	\N	2026-06-30 15:25:15.976005+00	1
f6d4158c-e9e0-40d6-8efd-fa3ae9ffb118	ae15ccc622578b7eab6972aee33a01f99648cc52a5e3f83daf39b7c1f77f87c8	2026-07-01 07:46:02.987476+00	20260701074602_add_content_model	\N	\N	2026-07-01 07:46:02.968322+00	1
10381b1f-2c84-441d-8bf8-03bff4d27528	a56bd26cc4592fd12acc4c3182b0a1636df280fd2074912d97e87ac25d09e538	2026-07-01 10:44:40.451774+00	20260701173000_location_as_array	\N	\N	2026-07-01 10:44:40.422005+00	1
\.


--
-- Name: Content Content_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Content"
    ADD CONSTRAINT "Content_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Content_contentId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Content_contentId_key" ON public."Content" USING btree ("contentId");


--
-- Name: Content_status_scheduledDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Content_status_scheduledDate_idx" ON public."Content" USING btree (status, "scheduledDate");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: Content Content_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Content"
    ADD CONSTRAINT "Content_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict oCxopRztL00k39ccmISxMufJfjTPZqdXySSa7tA1ikec9C4WuBZPehe0VnUVq0j

--
-- Database "n8n" dump
--

--
-- PostgreSQL database dump
--

\restrict RWkza8LtxCKhgGHO6gAkNTAOzPeMeb5hKzKdN2HWlrausW2cXLm7yFG76yTwNej

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: n8n; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE n8n WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


ALTER DATABASE n8n OWNER TO postgres;

\unrestrict RWkza8LtxCKhgGHO6gAkNTAOzPeMeb5hKzKdN2HWlrausW2cXLm7yFG76yTwNej
\connect n8n
\restrict RWkza8LtxCKhgGHO6gAkNTAOzPeMeb5hKzKdN2HWlrausW2cXLm7yFG76yTwNej

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: increment_workflow_version(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.increment_workflow_version() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
			BEGIN
				IF NEW."versionCounter" IS NOT DISTINCT FROM OLD."versionCounter"
					AND (NEW."nodes"::text IS DISTINCT FROM OLD."nodes"::text
						OR NEW."settings"::text IS DISTINCT FROM OLD."settings"::text) THEN
					NEW."versionCounter" = OLD."versionCounter" + 1;
				END IF;
				RETURN NEW;
			END;
			$$;


ALTER FUNCTION public.increment_workflow_version() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: agent_chat_subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.agent_chat_subscriptions (
    "agentId" character varying(36) NOT NULL,
    "integrationType" character varying(64) NOT NULL,
    "credentialId" character varying(255) NOT NULL,
    "threadId" character varying(255) NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CHK_agent_chat_subscriptions_integrationType" CHECK ((("integrationType")::text = ANY ((ARRAY['telegram'::character varying, 'slack'::character varying, 'linear'::character varying])::text[])))
);


ALTER TABLE public.agent_chat_subscriptions OWNER TO postgres;

--
-- Name: COLUMN agent_chat_subscriptions."agentId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.agent_chat_subscriptions."agentId" IS 'Agent that owns this subscription';


--
-- Name: COLUMN agent_chat_subscriptions."integrationType"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.agent_chat_subscriptions."integrationType" IS 'Chat integration platform for this subscription';


--
-- Name: COLUMN agent_chat_subscriptions."credentialId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.agent_chat_subscriptions."credentialId" IS 'Credential connection that owns this subscription';


--
-- Name: COLUMN agent_chat_subscriptions."threadId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.agent_chat_subscriptions."threadId" IS 'Platform thread ID the agent is subscribed to';


--
-- Name: agent_checkpoints; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.agent_checkpoints (
    "runId" character varying(255) NOT NULL,
    "agentId" character varying(255),
    state text,
    expired boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL
);


ALTER TABLE public.agent_checkpoints OWNER TO postgres;

--
-- Name: agent_execution; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.agent_execution (
    id character varying(36) NOT NULL,
    "threadId" character varying(128) NOT NULL,
    status character varying(16) NOT NULL,
    "startedAt" timestamp(3) with time zone,
    "stoppedAt" timestamp(3) with time zone,
    duration integer DEFAULT 0 NOT NULL,
    "userMessage" text NOT NULL,
    "assistantResponse" text NOT NULL,
    model character varying(255),
    "promptTokens" integer,
    "completionTokens" integer,
    "totalTokens" integer,
    cost double precision,
    "toolCalls" json,
    timeline json,
    error text,
    "hitlStatus" character varying(16),
    source character varying(32),
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CHK_agent_execution_hitlStatus" CHECK ((("hitlStatus")::text = ANY ((ARRAY['suspended'::character varying, 'resumed'::character varying])::text[]))),
    CONSTRAINT "CHK_agent_execution_status" CHECK (((status)::text = ANY ((ARRAY['success'::character varying, 'error'::character varying])::text[])))
);


ALTER TABLE public.agent_execution OWNER TO postgres;

--
-- Name: agent_execution_threads; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.agent_execution_threads (
    id character varying(128) NOT NULL,
    "agentId" character varying(36) NOT NULL,
    "agentName" character varying(255) NOT NULL,
    "projectId" character varying(255) NOT NULL,
    "sessionNumber" integer DEFAULT 0 NOT NULL,
    "totalPromptTokens" integer DEFAULT 0 NOT NULL,
    "totalCompletionTokens" integer DEFAULT 0 NOT NULL,
    "totalCost" double precision DEFAULT 0 NOT NULL,
    "totalDuration" integer DEFAULT 0 NOT NULL,
    title character varying(255),
    emoji character varying(8),
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "taskId" character varying(32),
    "taskVersionId" character varying(36),
    "parentThreadId" character varying(128),
    "parentAgentId" character varying(36)
);


ALTER TABLE public.agent_execution_threads OWNER TO postgres;

--
-- Name: COLUMN agent_execution_threads."taskId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.agent_execution_threads."taskId" IS 'Published task ID that triggered this session; not an FK because published runs can outlive draft task definition rows';


--
-- Name: COLUMN agent_execution_threads."taskVersionId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.agent_execution_threads."taskVersionId" IS 'Published agent_history version that supplied the task snapshot';


--
-- Name: COLUMN agent_execution_threads."parentThreadId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.agent_execution_threads."parentThreadId" IS 'Parent session thread id that delegated this subagent run.';


--
-- Name: COLUMN agent_execution_threads."parentAgentId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.agent_execution_threads."parentAgentId" IS 'Saved agent id of the parent that delegated this subagent run.';


--
-- Name: agent_files; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.agent_files (
    id character varying(16) NOT NULL,
    "agentId" character varying(36) NOT NULL,
    "binaryDataId" text NOT NULL,
    "fileName" character varying(255) NOT NULL,
    "mimeType" character varying(255) NOT NULL,
    "fileSizeBytes" integer NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL
);


ALTER TABLE public.agent_files OWNER TO postgres;

--
-- Name: COLUMN agent_files.id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.agent_files.id IS 'Application-generated n8n nano ID';


--
-- Name: COLUMN agent_files."agentId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.agent_files."agentId" IS 'Agent that owns this uploaded file';


--
-- Name: COLUMN agent_files."binaryDataId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.agent_files."binaryDataId" IS 'Opaque BinaryDataService reference (mode-prefixed, e.g. "filesystem-v2:<uuid>"); not an FK to binary_data, which only has rows in DB storage mode';


--
-- Name: COLUMN agent_files."fileSizeBytes"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.agent_files."fileSizeBytes" IS 'Uploaded file size in bytes';


--
-- Name: agent_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.agent_history (
    "versionId" character varying(36) NOT NULL,
    "agentId" character varying(36) NOT NULL,
    schema json,
    tools json,
    skills json,
    "publishedById" uuid,
    author character varying(255) NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL
);


ALTER TABLE public.agent_history OWNER TO postgres;

--
-- Name: COLUMN agent_history.schema; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.agent_history.schema IS 'Frozen snapshot of the published AgentJsonConfig';


--
-- Name: COLUMN agent_history.tools; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.agent_history.tools IS 'Frozen map of `toolId → { code, descriptor }` at publish time';


--
-- Name: COLUMN agent_history.skills; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.agent_history.skills IS 'Frozen map of `skillId → AgentSkill` at publish time';


--
-- Name: agent_task_definition; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.agent_task_definition (
    id character varying(32) NOT NULL,
    "agentId" character varying(36) NOT NULL,
    name character varying(128) NOT NULL,
    objective text NOT NULL,
    "cronExpression" character varying(128) NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL
);


ALTER TABLE public.agent_task_definition OWNER TO postgres;

--
-- Name: COLUMN agent_task_definition.id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.agent_task_definition.id IS 'Application-generated task ID referenced from agent JSON config';


--
-- Name: COLUMN agent_task_definition."agentId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.agent_task_definition."agentId" IS 'Owning agent; task definitions are deleted when the agent is deleted';


--
-- Name: COLUMN agent_task_definition.objective; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.agent_task_definition.objective IS 'User-authored instruction sent to the agent when this task runs';


--
-- Name: COLUMN agent_task_definition."cronExpression"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.agent_task_definition."cronExpression" IS 'Cron schedule evaluated using the instance timezone';


--
-- Name: agent_task_run_lock; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.agent_task_run_lock (
    "agentId" character varying(36) NOT NULL,
    "taskId" character varying(32) NOT NULL,
    "holderId" uuid NOT NULL,
    "heldUntil" timestamp(3) with time zone NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL
);


ALTER TABLE public.agent_task_run_lock OWNER TO postgres;

--
-- Name: COLUMN agent_task_run_lock."agentId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.agent_task_run_lock."agentId" IS 'Published agent whose scheduled task run is locked';


--
-- Name: COLUMN agent_task_run_lock."taskId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.agent_task_run_lock."taskId" IS 'Published task ID whose scheduled run is locked';


--
-- Name: COLUMN agent_task_run_lock."holderId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.agent_task_run_lock."holderId" IS 'Ephemeral lock owner token generated by the running main';


--
-- Name: COLUMN agent_task_run_lock."heldUntil"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.agent_task_run_lock."heldUntil" IS 'Time after which another main can claim this task run lock';


--
-- Name: agent_task_snapshot; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.agent_task_snapshot (
    "versionId" character varying(36) NOT NULL,
    "taskId" character varying(32) NOT NULL,
    enabled boolean NOT NULL,
    name character varying(128) NOT NULL,
    objective text NOT NULL,
    "cronExpression" character varying(128) NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL
);


ALTER TABLE public.agent_task_snapshot OWNER TO postgres;

--
-- Name: COLUMN agent_task_snapshot."versionId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.agent_task_snapshot."versionId" IS 'Published agent_history version this task snapshot belongs to';


--
-- Name: COLUMN agent_task_snapshot."taskId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.agent_task_snapshot."taskId" IS 'Stable task ID referenced from the published agent JSON config';


--
-- Name: COLUMN agent_task_snapshot.enabled; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.agent_task_snapshot.enabled IS 'Published enabled state for this task at publish time';


--
-- Name: COLUMN agent_task_snapshot.objective; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.agent_task_snapshot.objective IS 'User-authored instruction sent to the agent when this task runs';


--
-- Name: COLUMN agent_task_snapshot."cronExpression"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.agent_task_snapshot."cronExpression" IS 'Cron schedule evaluated using the instance timezone';


--
-- Name: agents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.agents (
    id character varying(36) NOT NULL,
    name character varying(128) NOT NULL,
    description character varying(512),
    "projectId" character varying(255) NOT NULL,
    integrations json DEFAULT '[]'::json NOT NULL,
    schema json,
    tools json DEFAULT '{}'::json NOT NULL,
    skills json DEFAULT '{}'::json NOT NULL,
    "versionId" character varying(36),
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "activeVersionId" character varying(36)
);


ALTER TABLE public.agents OWNER TO postgres;

--
-- Name: agents_memory_entries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.agents_memory_entries (
    id character varying(36) NOT NULL,
    "agentId" character varying(36) NOT NULL,
    "resourceId" character varying(255) NOT NULL,
    content text NOT NULL,
    "contentHash" character varying(64) NOT NULL,
    status character varying(16) NOT NULL,
    "supersededBy" character varying(36),
    "embeddingModel" character varying(128),
    embedding json,
    metadata json,
    "lastSeenAt" timestamp(3) with time zone NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CHK_agents_memory_entries_status" CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'superseded'::character varying, 'dropped'::character varying])::text[])))
);


ALTER TABLE public.agents_memory_entries OWNER TO postgres;

--
-- Name: COLUMN agents_memory_entries."agentId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.agents_memory_entries."agentId" IS 'Agent that owns this episodic memory entry';


--
-- Name: COLUMN agents_memory_entries."resourceId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.agents_memory_entries."resourceId" IS 'agents_resources.id partition used for episodic recall scope';


--
-- Name: COLUMN agents_memory_entries."supersededBy"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.agents_memory_entries."supersededBy" IS 'Self-reference to replacement memory entry';


--
-- Name: COLUMN agents_memory_entries."embeddingModel"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.agents_memory_entries."embeddingModel" IS 'Embedding model used to produce embedding';


--
-- Name: COLUMN agents_memory_entries.embedding; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.agents_memory_entries.embedding IS 'Embedding vector for episodic recall';


--
-- Name: COLUMN agents_memory_entries.metadata; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.agents_memory_entries.metadata IS 'Optional system metadata for ranking and debugging';


--
-- Name: COLUMN agents_memory_entries."lastSeenAt"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.agents_memory_entries."lastSeenAt" IS 'Last time equivalent content was observed; updatedAt tracks row mutation time';


--
-- Name: agents_memory_entry_cursors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.agents_memory_entry_cursors (
    "agentId" character varying(36) NOT NULL,
    "observationScopeId" character varying(255) NOT NULL,
    "lastIndexedObservationId" character varying(36) NOT NULL,
    "lastIndexedObservationCreatedAt" timestamp(3) with time zone NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL
);


ALTER TABLE public.agents_memory_entry_cursors OWNER TO postgres;

--
-- Name: COLUMN agents_memory_entry_cursors."agentId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.agents_memory_entry_cursors."agentId" IS 'Agent that owns this cursor';


--
-- Name: COLUMN agents_memory_entry_cursors."observationScopeId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.agents_memory_entry_cursors."observationScopeId" IS 'agents_threads.id source stream indexed into episodic memory';


--
-- Name: COLUMN agents_memory_entry_cursors."lastIndexedObservationId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.agents_memory_entry_cursors."lastIndexedObservationId" IS 'Last observation-log row indexed into episodic memory';


--
-- Name: COLUMN agents_memory_entry_cursors."lastIndexedObservationCreatedAt"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.agents_memory_entry_cursors."lastIndexedObservationCreatedAt" IS 'Creation timestamp for the last indexed observation-log row';


--
-- Name: agents_memory_entry_locks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.agents_memory_entry_locks (
    "agentId" character varying(36) NOT NULL,
    "resourceId" character varying(255) NOT NULL,
    "holderId" character varying(64) NOT NULL,
    "heldUntil" timestamp(3) with time zone NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL
);


ALTER TABLE public.agents_memory_entry_locks OWNER TO postgres;

--
-- Name: COLUMN agents_memory_entry_locks."agentId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.agents_memory_entry_locks."agentId" IS 'Agent that owns this lock';


--
-- Name: COLUMN agents_memory_entry_locks."resourceId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.agents_memory_entry_locks."resourceId" IS 'agents_resources.id partition locked for episodic indexing';


--
-- Name: COLUMN agents_memory_entry_locks."holderId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.agents_memory_entry_locks."holderId" IS 'Ephemeral background-task lock owner token';


--
-- Name: agents_memory_entry_sources; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.agents_memory_entry_sources (
    id character varying(36) NOT NULL,
    "agentId" character varying(36) NOT NULL,
    "memoryEntryId" character varying(36) NOT NULL,
    "observationId" character varying(36) NOT NULL,
    "threadId" character varying(255) NOT NULL,
    "evidenceHash" character varying(64) NOT NULL,
    "evidenceText" text NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL
);


ALTER TABLE public.agents_memory_entry_sources OWNER TO postgres;

--
-- Name: COLUMN agents_memory_entry_sources."agentId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.agents_memory_entry_sources."agentId" IS 'Agent that owns the linked episodic memory entry source';


--
-- Name: COLUMN agents_memory_entry_sources."memoryEntryId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.agents_memory_entry_sources."memoryEntryId" IS 'Episodic memory entry linked to this source evidence';


--
-- Name: COLUMN agents_memory_entry_sources."observationId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.agents_memory_entry_sources."observationId" IS 'Observation-log row used as source evidence';


--
-- Name: COLUMN agents_memory_entry_sources."threadId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.agents_memory_entry_sources."threadId" IS 'Source conversation thread that produced the linked observation';


--
-- Name: COLUMN agents_memory_entry_sources."evidenceHash"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.agents_memory_entry_sources."evidenceHash" IS 'Bounded hash used to deduplicate exact evidence links';


--
-- Name: COLUMN agents_memory_entry_sources."evidenceText"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.agents_memory_entry_sources."evidenceText" IS 'Exact source evidence text from the observation, not recall scope';


--
-- Name: agents_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.agents_messages (
    id character varying(36) NOT NULL,
    "threadId" character varying(255) NOT NULL,
    "resourceId" character varying(255) NOT NULL,
    role character varying(36) NOT NULL,
    type character varying(36),
    content json NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL
);


ALTER TABLE public.agents_messages OWNER TO postgres;

--
-- Name: agents_observation_cursors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.agents_observation_cursors (
    "agentId" character varying(36) NOT NULL,
    "observationScopeId" character varying(255) NOT NULL,
    "lastObservedMessageId" character varying(36) NOT NULL,
    "lastObservedAt" timestamp(3) with time zone NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL
);


ALTER TABLE public.agents_observation_cursors OWNER TO postgres;

--
-- Name: COLUMN agents_observation_cursors."agentId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.agents_observation_cursors."agentId" IS 'Agent that owns this cursor';


--
-- Name: COLUMN agents_observation_cursors."observationScopeId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.agents_observation_cursors."observationScopeId" IS 'agents_threads.id source stream checkpointed by this cursor';


--
-- Name: agents_observation_locks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.agents_observation_locks (
    "agentId" character varying(36) NOT NULL,
    "observationScopeId" character varying(255) NOT NULL,
    "taskKind" character varying(20) NOT NULL,
    "holderId" character varying(64) NOT NULL,
    "heldUntil" timestamp(3) with time zone NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CHK_agents_observation_locks_taskKind" CHECK ((("taskKind")::text = ANY ((ARRAY['observer'::character varying, 'reflector'::character varying])::text[])))
);


ALTER TABLE public.agents_observation_locks OWNER TO postgres;

--
-- Name: COLUMN agents_observation_locks."agentId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.agents_observation_locks."agentId" IS 'Agent that owns this lock';


--
-- Name: COLUMN agents_observation_locks."observationScopeId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.agents_observation_locks."observationScopeId" IS 'agents_threads.id source stream locked for observation tasks';


--
-- Name: COLUMN agents_observation_locks."holderId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.agents_observation_locks."holderId" IS 'Ephemeral background-task lock owner token, not a user ID';


--
-- Name: agents_observations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.agents_observations (
    id character varying(36) NOT NULL,
    "agentId" character varying(36) NOT NULL,
    "observationScopeId" character varying(255) NOT NULL,
    marker character varying(16) NOT NULL,
    text text NOT NULL,
    "parentId" character varying(36),
    "tokenCount" integer DEFAULT 0 NOT NULL,
    status character varying(16) NOT NULL,
    "supersededBy" character varying(36),
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CHK_agents_observations_marker" CHECK (((marker)::text = ANY ((ARRAY['critical'::character varying, 'important'::character varying, 'info'::character varying, 'completion'::character varying])::text[]))),
    CONSTRAINT "CHK_agents_observations_status" CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'superseded'::character varying, 'dropped'::character varying])::text[])))
);


ALTER TABLE public.agents_observations OWNER TO postgres;

--
-- Name: COLUMN agents_observations.id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.agents_observations.id IS 'Application-generated n8n string ID, not a database UUID';


--
-- Name: COLUMN agents_observations."agentId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.agents_observations."agentId" IS 'Agent that owns this observation row';


--
-- Name: COLUMN agents_observations."observationScopeId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.agents_observations."observationScopeId" IS 'agents_threads.id source stream for this observation log';


--
-- Name: agents_resources; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.agents_resources (
    id character varying(255) NOT NULL,
    metadata text,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL
);


ALTER TABLE public.agents_resources OWNER TO postgres;

--
-- Name: agents_threads; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.agents_threads (
    id character varying(128) NOT NULL,
    "resourceId" character varying(255) NOT NULL,
    title character varying(255),
    metadata text,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL
);


ALTER TABLE public.agents_threads OWNER TO postgres;

--
-- Name: ai_builder_temporary_workflow; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ai_builder_temporary_workflow (
    "workflowId" character varying(36) NOT NULL,
    "threadId" uuid NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL
);


ALTER TABLE public.ai_builder_temporary_workflow OWNER TO postgres;

--
-- Name: annotation_tag_entity; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.annotation_tag_entity (
    id character varying(16) NOT NULL,
    name character varying(24) NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL
);


ALTER TABLE public.annotation_tag_entity OWNER TO postgres;

--
-- Name: auth_identity; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_identity (
    "userId" uuid,
    "providerId" character varying(255) NOT NULL,
    "providerType" character varying(32) NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL
);


ALTER TABLE public.auth_identity OWNER TO postgres;

--
-- Name: auth_provider_sync_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_provider_sync_history (
    id integer NOT NULL,
    "providerType" character varying(32) NOT NULL,
    "runMode" text NOT NULL,
    status text NOT NULL,
    "startedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "endedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    scanned integer NOT NULL,
    created integer NOT NULL,
    updated integer NOT NULL,
    disabled integer NOT NULL,
    error text
);


ALTER TABLE public.auth_provider_sync_history OWNER TO postgres;

--
-- Name: auth_provider_sync_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.auth_provider_sync_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.auth_provider_sync_history_id_seq OWNER TO postgres;

--
-- Name: auth_provider_sync_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.auth_provider_sync_history_id_seq OWNED BY public.auth_provider_sync_history.id;


--
-- Name: binary_data; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.binary_data (
    "fileId" uuid NOT NULL,
    "sourceType" character varying(50) NOT NULL,
    "sourceId" character varying(255) NOT NULL,
    data bytea NOT NULL,
    "mimeType" character varying(255),
    "fileName" character varying(255),
    "fileSize" integer NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CHK_binary_data_sourceType" CHECK ((("sourceType")::text = ANY ((ARRAY['execution'::character varying, 'chat_message_attachment'::character varying, 'agent_file'::character varying])::text[])))
);


ALTER TABLE public.binary_data OWNER TO postgres;

--
-- Name: COLUMN binary_data."sourceType"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.binary_data."sourceType" IS 'Source the file belongs to, e.g. ''execution''';


--
-- Name: COLUMN binary_data."sourceId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.binary_data."sourceId" IS 'ID of the source, e.g. execution ID';


--
-- Name: COLUMN binary_data.data; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.binary_data.data IS 'Raw, not base64 encoded';


--
-- Name: COLUMN binary_data."fileSize"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.binary_data."fileSize" IS 'In bytes';


--
-- Name: chat_hub_agent_tools; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat_hub_agent_tools (
    "agentId" uuid NOT NULL,
    "toolId" uuid NOT NULL
);


ALTER TABLE public.chat_hub_agent_tools OWNER TO postgres;

--
-- Name: chat_hub_agents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat_hub_agents (
    id uuid NOT NULL,
    name character varying(256) NOT NULL,
    description character varying(512),
    "systemPrompt" text NOT NULL,
    "ownerId" uuid NOT NULL,
    "credentialId" character varying(36),
    provider character varying(16) NOT NULL,
    model character varying(64) NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    icon json,
    files json DEFAULT '[]'::json NOT NULL,
    "suggestedPrompts" json DEFAULT '[]'::json NOT NULL
);


ALTER TABLE public.chat_hub_agents OWNER TO postgres;

--
-- Name: COLUMN chat_hub_agents.provider; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.chat_hub_agents.provider IS 'ChatHubProvider enum: "openai", "anthropic", "google", "n8n"';


--
-- Name: COLUMN chat_hub_agents.model; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.chat_hub_agents.model IS 'Model name used at the respective Model node, ie. "gpt-4"';


--
-- Name: chat_hub_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat_hub_messages (
    id uuid NOT NULL,
    "sessionId" uuid NOT NULL,
    "previousMessageId" uuid,
    "revisionOfMessageId" uuid,
    "retryOfMessageId" uuid,
    type character varying(16) NOT NULL,
    name character varying(128) NOT NULL,
    content text NOT NULL,
    provider character varying(16),
    model character varying(256),
    "workflowId" character varying(36),
    "executionId" integer,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "agentId" uuid,
    status character varying(16) DEFAULT 'success'::character varying NOT NULL,
    attachments json
);


ALTER TABLE public.chat_hub_messages OWNER TO postgres;

--
-- Name: COLUMN chat_hub_messages.type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.chat_hub_messages.type IS 'ChatHubMessageType enum: "human", "ai", "system", "tool", "generic"';


--
-- Name: COLUMN chat_hub_messages.provider; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.chat_hub_messages.provider IS 'ChatHubProvider enum: "openai", "anthropic", "google", "n8n"';


--
-- Name: COLUMN chat_hub_messages.model; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.chat_hub_messages.model IS 'Model name used at the respective Model node, ie. "gpt-4"';


--
-- Name: COLUMN chat_hub_messages."agentId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.chat_hub_messages."agentId" IS 'ID of the custom agent (if provider is "custom-agent")';


--
-- Name: COLUMN chat_hub_messages.status; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.chat_hub_messages.status IS 'ChatHubMessageStatus enum, eg. "success", "error", "running", "cancelled"';


--
-- Name: COLUMN chat_hub_messages.attachments; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.chat_hub_messages.attachments IS 'File attachments for the message (if any), stored as JSON. Files are stored as base64-encoded data URLs.';


--
-- Name: chat_hub_session_tools; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat_hub_session_tools (
    "sessionId" uuid NOT NULL,
    "toolId" uuid NOT NULL
);


ALTER TABLE public.chat_hub_session_tools OWNER TO postgres;

--
-- Name: chat_hub_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat_hub_sessions (
    id uuid NOT NULL,
    title character varying(256) NOT NULL,
    "ownerId" uuid NOT NULL,
    "lastMessageAt" timestamp(3) with time zone NOT NULL,
    "credentialId" character varying(36),
    provider character varying(16),
    model character varying(256),
    "workflowId" character varying(36),
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "agentId" uuid,
    "agentName" character varying(128),
    type character varying(16) DEFAULT 'production'::character varying NOT NULL,
    CONSTRAINT "CHK_chat_hub_sessions_type" CHECK (((type)::text = ANY ((ARRAY['production'::character varying, 'manual'::character varying])::text[])))
);


ALTER TABLE public.chat_hub_sessions OWNER TO postgres;

--
-- Name: COLUMN chat_hub_sessions.provider; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.chat_hub_sessions.provider IS 'ChatHubProvider enum: "openai", "anthropic", "google", "n8n"';


--
-- Name: COLUMN chat_hub_sessions.model; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.chat_hub_sessions.model IS 'Model name used at the respective Model node, ie. "gpt-4"';


--
-- Name: COLUMN chat_hub_sessions."agentId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.chat_hub_sessions."agentId" IS 'ID of the custom agent (if provider is "custom-agent")';


--
-- Name: COLUMN chat_hub_sessions."agentName"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.chat_hub_sessions."agentName" IS 'Cached name of the custom agent (if provider is "custom-agent")';


--
-- Name: chat_hub_tools; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat_hub_tools (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    type character varying(255) NOT NULL,
    "typeVersion" double precision NOT NULL,
    "ownerId" uuid NOT NULL,
    definition json NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL
);


ALTER TABLE public.chat_hub_tools OWNER TO postgres;

--
-- Name: credential_dependency; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.credential_dependency (
    id integer NOT NULL,
    "credentialId" character varying(36) NOT NULL,
    "dependencyType" character varying(64) NOT NULL,
    "dependencyId" character varying(255) NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL
);


ALTER TABLE public.credential_dependency OWNER TO postgres;

--
-- Name: credential_dependency_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.credential_dependency ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.credential_dependency_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: credentials_entity; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.credentials_entity (
    name character varying(128) NOT NULL,
    data text NOT NULL,
    type character varying(128) NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    id character varying(36) NOT NULL,
    "isManaged" boolean DEFAULT false NOT NULL,
    "isGlobal" boolean DEFAULT false NOT NULL,
    "isResolvable" boolean DEFAULT false NOT NULL,
    "resolvableAllowFallback" boolean DEFAULT false NOT NULL,
    "resolverId" character varying(16)
);


ALTER TABLE public.credentials_entity OWNER TO postgres;

--
-- Name: data_table; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.data_table (
    id character varying(36) NOT NULL,
    name character varying(128) NOT NULL,
    "projectId" character varying(36) NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL
);


ALTER TABLE public.data_table OWNER TO postgres;

--
-- Name: data_table_column; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.data_table_column (
    id character varying(36) NOT NULL,
    name character varying(128) NOT NULL,
    type character varying(32) NOT NULL,
    index integer NOT NULL,
    "dataTableId" character varying(36) NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL
);


ALTER TABLE public.data_table_column OWNER TO postgres;

--
-- Name: COLUMN data_table_column.type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.data_table_column.type IS 'Expected: string, number, boolean, or date (not enforced as a constraint)';


--
-- Name: COLUMN data_table_column.index; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.data_table_column.index IS 'Column order, starting from 0 (0 = first column)';


--
-- Name: deployment_key; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.deployment_key (
    id character varying(36) NOT NULL,
    type character varying(64) NOT NULL,
    value text NOT NULL,
    algorithm character varying(20),
    status character varying(20) NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL
);


ALTER TABLE public.deployment_key OWNER TO postgres;

--
-- Name: dynamic_credential_entry; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dynamic_credential_entry (
    credential_id character varying(16) NOT NULL,
    subject_id character varying(2048) NOT NULL,
    resolver_id character varying(16) NOT NULL,
    data text NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL
);


ALTER TABLE public.dynamic_credential_entry OWNER TO postgres;

--
-- Name: dynamic_credential_resolver; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dynamic_credential_resolver (
    id character varying(16) NOT NULL,
    name character varying(128) NOT NULL,
    type character varying(128) NOT NULL,
    config text NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL
);


ALTER TABLE public.dynamic_credential_resolver OWNER TO postgres;

--
-- Name: COLUMN dynamic_credential_resolver.config; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.dynamic_credential_resolver.config IS 'Encrypted resolver configuration (JSON encrypted as string)';


--
-- Name: dynamic_credential_user_entry; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dynamic_credential_user_entry (
    "credentialId" character varying(16) NOT NULL,
    "userId" uuid NOT NULL,
    "resolverId" character varying(16) NOT NULL,
    data text NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL
);


ALTER TABLE public.dynamic_credential_user_entry OWNER TO postgres;

--
-- Name: evaluation_collection; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.evaluation_collection (
    id character varying(36) NOT NULL,
    name character varying(128) NOT NULL,
    description text,
    "workflowId" character varying(36) NOT NULL,
    "evaluationConfigId" character varying(36) NOT NULL,
    "createdById" uuid,
    "insightsCache" json,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL
);


ALTER TABLE public.evaluation_collection OWNER TO postgres;

--
-- Name: evaluation_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.evaluation_config (
    id character varying(36) NOT NULL,
    "workflowId" character varying(36) NOT NULL,
    name character varying(128) NOT NULL,
    status character varying(16) DEFAULT 'valid'::character varying NOT NULL,
    "invalidReason" character varying(64),
    "datasetSource" character varying(32) NOT NULL,
    "datasetRef" json NOT NULL,
    "startNodeName" character varying(255) NOT NULL,
    "endNodeName" character varying(255) NOT NULL,
    metrics json NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL
);


ALTER TABLE public.evaluation_config OWNER TO postgres;

--
-- Name: event_destinations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.event_destinations (
    id uuid NOT NULL,
    destination jsonb NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL
);


ALTER TABLE public.event_destinations OWNER TO postgres;

--
-- Name: execution_annotation_tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.execution_annotation_tags (
    "annotationId" integer NOT NULL,
    "tagId" character varying(24) NOT NULL
);


ALTER TABLE public.execution_annotation_tags OWNER TO postgres;

--
-- Name: execution_annotations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.execution_annotations (
    id integer NOT NULL,
    "executionId" integer NOT NULL,
    vote character varying(6),
    note text,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL
);


ALTER TABLE public.execution_annotations OWNER TO postgres;

--
-- Name: execution_annotations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.execution_annotations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.execution_annotations_id_seq OWNER TO postgres;

--
-- Name: execution_annotations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.execution_annotations_id_seq OWNED BY public.execution_annotations.id;


--
-- Name: execution_data; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.execution_data (
    "executionId" integer NOT NULL,
    "workflowData" json NOT NULL,
    data text NOT NULL,
    "workflowVersionId" character varying(36)
);


ALTER TABLE public.execution_data OWNER TO postgres;

--
-- Name: execution_entity; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.execution_entity (
    id integer NOT NULL,
    finished boolean NOT NULL,
    mode character varying NOT NULL,
    "retryOf" character varying,
    "retrySuccessId" character varying,
    "startedAt" timestamp(3) with time zone,
    "stoppedAt" timestamp(3) with time zone,
    "waitTill" timestamp(3) with time zone,
    status character varying NOT NULL,
    "workflowId" character varying(36) NOT NULL,
    "deletedAt" timestamp(3) with time zone,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "storedAt" character varying(2) DEFAULT 'db'::character varying NOT NULL,
    "tracingContext" json,
    "deduplicationKey" character varying(255),
    "jsonSizeBytes" bigint DEFAULT 0 NOT NULL,
    "workflowVersionId" character varying(36) DEFAULT NULL::character varying,
    "binaryDataSizeBytes" bigint DEFAULT 0 NOT NULL,
    CONSTRAINT "CHK_execution_entity_storedAt" CHECK ((("storedAt")::text = ANY ((ARRAY['db'::character varying, 'fs'::character varying, 's3'::character varying, 'az'::character varying])::text[])))
);


ALTER TABLE public.execution_entity OWNER TO postgres;

--
-- Name: COLUMN execution_entity."jsonSizeBytes"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.execution_entity."jsonSizeBytes" IS 'Byte size of the JSON execution data bundle (run data, workflow snapshot, version id); excludes binary data. 0 means unknown.';


--
-- Name: COLUMN execution_entity."workflowVersionId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.execution_entity."workflowVersionId" IS 'Version id of the workflow run by this execution; denormalized from the data bundle.';


--
-- Name: COLUMN execution_entity."binaryDataSizeBytes"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.execution_entity."binaryDataSizeBytes" IS 'Byte size of binary data offloaded to separate storage (db/fs/S3), deduplicated by blob; excludes inline binary counted in jsonSizeBytes. 0 means unknown.';


--
-- Name: execution_entity_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.execution_entity_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.execution_entity_id_seq OWNER TO postgres;

--
-- Name: execution_entity_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.execution_entity_id_seq OWNED BY public.execution_entity.id;


--
-- Name: execution_metadata; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.execution_metadata (
    id integer NOT NULL,
    "executionId" integer NOT NULL,
    key character varying(255) NOT NULL,
    value text NOT NULL
);


ALTER TABLE public.execution_metadata OWNER TO postgres;

--
-- Name: execution_metadata_temp_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.execution_metadata_temp_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.execution_metadata_temp_id_seq OWNER TO postgres;

--
-- Name: execution_metadata_temp_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.execution_metadata_temp_id_seq OWNED BY public.execution_metadata.id;


--
-- Name: folder; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.folder (
    id character varying(36) NOT NULL,
    name character varying(128) NOT NULL,
    "parentFolderId" character varying(36),
    "projectId" character varying(36) NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL
);


ALTER TABLE public.folder OWNER TO postgres;

--
-- Name: folder_tag; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.folder_tag (
    "folderId" character varying(36) NOT NULL,
    "tagId" character varying(36) NOT NULL
);


ALTER TABLE public.folder_tag OWNER TO postgres;

--
-- Name: insights_by_period; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.insights_by_period (
    id integer NOT NULL,
    "metaId" integer NOT NULL,
    type integer NOT NULL,
    value bigint NOT NULL,
    "periodUnit" integer NOT NULL,
    "periodStart" timestamp(0) with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.insights_by_period OWNER TO postgres;

--
-- Name: COLUMN insights_by_period.type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.insights_by_period.type IS '0: time_saved_minutes, 1: runtime_milliseconds, 2: success, 3: failure';


--
-- Name: COLUMN insights_by_period."periodUnit"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.insights_by_period."periodUnit" IS '0: hour, 1: day, 2: week';


--
-- Name: insights_by_period_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.insights_by_period ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.insights_by_period_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: insights_metadata; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.insights_metadata (
    "metaId" integer NOT NULL,
    "workflowId" character varying(36),
    "projectId" character varying(36),
    "workflowName" character varying(128) NOT NULL,
    "projectName" character varying(255) NOT NULL
);


ALTER TABLE public.insights_metadata OWNER TO postgres;

--
-- Name: insights_metadata_metaId_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.insights_metadata ALTER COLUMN "metaId" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."insights_metadata_metaId_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: insights_raw; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.insights_raw (
    id integer NOT NULL,
    "metaId" integer NOT NULL,
    type integer NOT NULL,
    value bigint NOT NULL,
    "timestamp" timestamp(0) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.insights_raw OWNER TO postgres;

--
-- Name: COLUMN insights_raw.type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.insights_raw.type IS '0: time_saved_minutes, 1: runtime_milliseconds, 2: success, 3: failure';


--
-- Name: insights_raw_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.insights_raw ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.insights_raw_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: installed_nodes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.installed_nodes (
    name character varying(200) NOT NULL,
    type character varying(200) NOT NULL,
    "latestVersion" integer DEFAULT 1 NOT NULL,
    package character varying(241) NOT NULL
);


ALTER TABLE public.installed_nodes OWNER TO postgres;

--
-- Name: installed_packages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.installed_packages (
    "packageName" character varying(214) NOT NULL,
    "installedVersion" character varying(50) NOT NULL,
    "authorName" character varying(70),
    "authorEmail" character varying(70),
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL
);


ALTER TABLE public.installed_packages OWNER TO postgres;

--
-- Name: instance_ai_checkpoints; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.instance_ai_checkpoints (
    key character varying(255) NOT NULL,
    "runId" character varying(255),
    "threadId" uuid NOT NULL,
    "resourceId" character varying(255),
    state json,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "expiredAt" timestamp(3) with time zone,
    CONSTRAINT instance_ai_checkpoints_state_tombstone_check CHECK (((("expiredAt" IS NOT NULL) AND (state IS NULL)) OR ("expiredAt" IS NULL)))
);


ALTER TABLE public.instance_ai_checkpoints OWNER TO postgres;

--
-- Name: COLUMN instance_ai_checkpoints.key; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.instance_ai_checkpoints.key IS 'Opaque checkpoint key from the agent runtime.';


--
-- Name: COLUMN instance_ai_checkpoints."runId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.instance_ai_checkpoints."runId" IS 'Run ID parsed from the checkpoint key when available.';


--
-- Name: COLUMN instance_ai_checkpoints."threadId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.instance_ai_checkpoints."threadId" IS 'Instance AI thread that owns the checkpoint.';


--
-- Name: COLUMN instance_ai_checkpoints."resourceId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.instance_ai_checkpoints."resourceId" IS 'Resource ID recorded by the agent runtime.';


--
-- Name: COLUMN instance_ai_checkpoints.state; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.instance_ai_checkpoints.state IS 'Serializable agent state snapshot stored as JSON.';


--
-- Name: COLUMN instance_ai_checkpoints."expiredAt"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.instance_ai_checkpoints."expiredAt" IS 'Soft-delete timestamp: null means live; non-null marks the row as a tombstone.';


--
-- Name: instance_ai_iteration_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.instance_ai_iteration_logs (
    id character varying(36) NOT NULL,
    "threadId" uuid NOT NULL,
    "taskKey" character varying NOT NULL,
    entry text NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL
);


ALTER TABLE public.instance_ai_iteration_logs OWNER TO postgres;

--
-- Name: instance_ai_mcp_registry_connections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.instance_ai_mcp_registry_connections (
    id uuid NOT NULL,
    "credentialId" character varying(36) NOT NULL,
    "serverSlug" character varying(255) NOT NULL,
    "toolFilter" json,
    "userId" uuid NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL
);


ALTER TABLE public.instance_ai_mcp_registry_connections OWNER TO postgres;

--
-- Name: COLUMN instance_ai_mcp_registry_connections."toolFilter"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.instance_ai_mcp_registry_connections."toolFilter" IS 'Optional MCP tool filter per registry connection: { mode: "allow" | "exclude", tools: string[] }';


--
-- Name: instance_ai_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.instance_ai_messages (
    id character varying(36) NOT NULL,
    "threadId" uuid NOT NULL,
    content text NOT NULL,
    role character varying(16) NOT NULL,
    type character varying(32),
    "resourceId" character varying(255),
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL
);


ALTER TABLE public.instance_ai_messages OWNER TO postgres;

--
-- Name: instance_ai_observation_cursors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.instance_ai_observation_cursors (
    "observationScopeId" uuid NOT NULL,
    "lastObservedMessageId" character varying(36) NOT NULL,
    "lastObservedAt" timestamp(3) with time zone NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL
);


ALTER TABLE public.instance_ai_observation_cursors OWNER TO postgres;

--
-- Name: COLUMN instance_ai_observation_cursors."observationScopeId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.instance_ai_observation_cursors."observationScopeId" IS 'instance_ai_threads.id source stream checkpointed by this cursor';


--
-- Name: instance_ai_observation_locks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.instance_ai_observation_locks (
    "observationScopeId" uuid NOT NULL,
    "taskKind" character varying(20) NOT NULL,
    "holderId" character varying(64) NOT NULL,
    "heldUntil" timestamp(3) with time zone NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CHK_instance_ai_observation_locks_taskKind" CHECK ((("taskKind")::text = ANY ((ARRAY['observer'::character varying, 'reflector'::character varying])::text[])))
);


ALTER TABLE public.instance_ai_observation_locks OWNER TO postgres;

--
-- Name: COLUMN instance_ai_observation_locks."observationScopeId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.instance_ai_observation_locks."observationScopeId" IS 'instance_ai_threads.id source stream locked for observation tasks';


--
-- Name: COLUMN instance_ai_observation_locks."holderId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.instance_ai_observation_locks."holderId" IS 'Ephemeral background-task lock owner token, not a user ID';


--
-- Name: instance_ai_observational_memory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.instance_ai_observational_memory (
    id character varying(36) NOT NULL,
    "lookupKey" character varying(255) NOT NULL,
    scope character varying(16) NOT NULL,
    "threadId" uuid,
    "resourceId" character varying(255) NOT NULL,
    "activeObservations" text DEFAULT ''::text NOT NULL,
    "originType" character varying(32) NOT NULL,
    config text NOT NULL,
    "generationCount" integer DEFAULT 0 NOT NULL,
    "lastObservedAt" timestamp(3) with time zone,
    "pendingMessageTokens" integer DEFAULT 0 NOT NULL,
    "totalTokensObserved" integer DEFAULT 0 NOT NULL,
    "observationTokenCount" integer DEFAULT 0 NOT NULL,
    "isObserving" boolean DEFAULT false NOT NULL,
    "isReflecting" boolean DEFAULT false NOT NULL,
    "observedMessageIds" json,
    "observedTimezone" character varying,
    "bufferedObservations" text,
    "bufferedObservationTokens" integer,
    "bufferedMessageIds" json,
    "bufferedReflection" text,
    "bufferedReflectionTokens" integer,
    "bufferedReflectionInputTokens" integer,
    "reflectedObservationLineCount" integer,
    "bufferedObservationChunks" json,
    "isBufferingObservation" boolean DEFAULT false NOT NULL,
    "isBufferingReflection" boolean DEFAULT false NOT NULL,
    "lastBufferedAtTokens" integer DEFAULT 0 NOT NULL,
    "lastBufferedAtTime" timestamp(3) with time zone,
    metadata json,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL
);


ALTER TABLE public.instance_ai_observational_memory OWNER TO postgres;

--
-- Name: instance_ai_observations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.instance_ai_observations (
    id character varying(36) NOT NULL,
    "observationScopeId" uuid NOT NULL,
    marker character varying(16) NOT NULL,
    text text NOT NULL,
    "parentId" character varying(36),
    "tokenCount" integer DEFAULT 0 NOT NULL,
    status character varying(16) NOT NULL,
    "supersededBy" character varying(36),
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CHK_instance_ai_observations_marker" CHECK (((marker)::text = ANY ((ARRAY['critical'::character varying, 'important'::character varying, 'info'::character varying, 'completion'::character varying])::text[]))),
    CONSTRAINT "CHK_instance_ai_observations_status" CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'superseded'::character varying, 'dropped'::character varying])::text[])))
);


ALTER TABLE public.instance_ai_observations OWNER TO postgres;

--
-- Name: COLUMN instance_ai_observations.id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.instance_ai_observations.id IS 'Application-generated n8n string ID, not a database UUID';


--
-- Name: COLUMN instance_ai_observations."observationScopeId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.instance_ai_observations."observationScopeId" IS 'instance_ai_threads.id source stream for this observation log';


--
-- Name: instance_ai_pending_confirmations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.instance_ai_pending_confirmations (
    "requestId" character varying(36) NOT NULL,
    "threadId" uuid NOT NULL,
    "userId" uuid NOT NULL,
    kind character varying(16) NOT NULL,
    "runId" character varying(36) NOT NULL,
    "toolCallId" character varying(64),
    "messageGroupId" character varying(36),
    "checkpointKey" character varying(255),
    "checkpointTaskId" character varying(36),
    "expiresAt" timestamp(3) with time zone,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CHK_instance_ai_pending_confirmations_kind" CHECK (((kind)::text = ANY ((ARRAY['suspended'::character varying, 'inline'::character varying])::text[])))
);


ALTER TABLE public.instance_ai_pending_confirmations OWNER TO postgres;

--
-- Name: COLUMN instance_ai_pending_confirmations."requestId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.instance_ai_pending_confirmations."requestId" IS 'HITL confirmation request identifier.';


--
-- Name: COLUMN instance_ai_pending_confirmations."threadId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.instance_ai_pending_confirmations."threadId" IS 'Instance AI thread that owns the confirmation.';


--
-- Name: COLUMN instance_ai_pending_confirmations."userId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.instance_ai_pending_confirmations."userId" IS 'User who is expected to confirm or cancel.';


--
-- Name: COLUMN instance_ai_pending_confirmations.kind; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.instance_ai_pending_confirmations.kind IS '''suspended'' (resumable from checkpoint) or ''inline'' (orchestrator-held Promise).';


--
-- Name: COLUMN instance_ai_pending_confirmations."runId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.instance_ai_pending_confirmations."runId" IS 'External run ID; reused on resume for SSE correlation.';


--
-- Name: COLUMN instance_ai_pending_confirmations."toolCallId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.instance_ai_pending_confirmations."toolCallId" IS 'Suspended tool call awaiting confirmation.';


--
-- Name: COLUMN instance_ai_pending_confirmations."messageGroupId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.instance_ai_pending_confirmations."messageGroupId" IS 'SSE event correlation group.';


--
-- Name: COLUMN instance_ai_pending_confirmations."checkpointKey"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.instance_ai_pending_confirmations."checkpointKey" IS 'FK to instance_ai_checkpoints.key; also the SDK runId used to resume.';


--
-- Name: COLUMN instance_ai_pending_confirmations."checkpointTaskId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.instance_ai_pending_confirmations."checkpointTaskId" IS 'Set when the suspended run was a planned-task checkpoint follow-up.';


--
-- Name: COLUMN instance_ai_pending_confirmations."expiresAt"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.instance_ai_pending_confirmations."expiresAt" IS 'TTL for the leader-only sweep; null disables auto-expiry.';


--
-- Name: instance_ai_resources; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.instance_ai_resources (
    id character varying(255) NOT NULL,
    "workingMemory" text,
    metadata json,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL
);


ALTER TABLE public.instance_ai_resources OWNER TO postgres;

--
-- Name: instance_ai_run_snapshots; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.instance_ai_run_snapshots (
    "threadId" uuid NOT NULL,
    "runId" character varying(36) NOT NULL,
    "messageGroupId" character varying(36),
    "runIds" json,
    tree text NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "langsmithRunId" character varying(36),
    "langsmithTraceId" character varying(36),
    "traceId" character varying(64),
    "spanId" character varying(64)
);


ALTER TABLE public.instance_ai_run_snapshots OWNER TO postgres;

--
-- Name: COLUMN instance_ai_run_snapshots."langsmithRunId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.instance_ai_run_snapshots."langsmithRunId" IS 'LangSmith run ID (UUID v4, e.g. "f47ac10b-58cc-4372-a567-0e02b2c3d479").';


--
-- Name: COLUMN instance_ai_run_snapshots."langsmithTraceId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.instance_ai_run_snapshots."langsmithTraceId" IS 'LangSmith trace ID (UUID v4, e.g. "f47ac10b-58cc-4372-a567-0e02b2c3d479").';


--
-- Name: COLUMN instance_ai_run_snapshots."traceId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.instance_ai_run_snapshots."traceId" IS 'OpenTelemetry trace ID for the root Instance AI run.';


--
-- Name: COLUMN instance_ai_run_snapshots."spanId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.instance_ai_run_snapshots."spanId" IS 'OpenTelemetry span ID for the root Instance AI run.';


--
-- Name: instance_ai_thread_grants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.instance_ai_thread_grants (
    "threadId" uuid NOT NULL,
    "userId" uuid NOT NULL,
    "grantKey" character varying(512) NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL
);


ALTER TABLE public.instance_ai_thread_grants OWNER TO postgres;

--
-- Name: COLUMN instance_ai_thread_grants."grantKey"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.instance_ai_thread_grants."grantKey" IS 'Namespaced "always allow" grant the user approved for the thread, e.g. "executions:run:<workflowId>". Wide enough to hold a namespace prefix plus a resource identifier.';


--
-- Name: instance_ai_threads; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.instance_ai_threads (
    id uuid NOT NULL,
    "resourceId" character varying(255) NOT NULL,
    title text DEFAULT ''::text NOT NULL,
    metadata json,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "projectId" character varying(36) NOT NULL
);


ALTER TABLE public.instance_ai_threads OWNER TO postgres;

--
-- Name: COLUMN instance_ai_threads."projectId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.instance_ai_threads."projectId" IS 'Project this thread is scoped to';


--
-- Name: instance_ai_workflow_snapshots; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.instance_ai_workflow_snapshots (
    "runId" character varying(36) NOT NULL,
    "workflowName" character varying(255) NOT NULL,
    "resourceId" character varying(255),
    status character varying,
    snapshot text NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL
);


ALTER TABLE public.instance_ai_workflow_snapshots OWNER TO postgres;

--
-- Name: instance_version_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.instance_version_history (
    id integer NOT NULL,
    major integer NOT NULL,
    minor integer NOT NULL,
    patch integer NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL
);


ALTER TABLE public.instance_version_history OWNER TO postgres;

--
-- Name: instance_version_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.instance_version_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.instance_version_history_id_seq OWNER TO postgres;

--
-- Name: instance_version_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.instance_version_history_id_seq OWNED BY public.instance_version_history.id;


--
-- Name: invalid_auth_token; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invalid_auth_token (
    token character varying(512) NOT NULL,
    "expiresAt" timestamp(3) with time zone NOT NULL
);


ALTER TABLE public.invalid_auth_token OWNER TO postgres;

--
-- Name: mcp_registry_server; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mcp_registry_server (
    slug character varying(255) NOT NULL,
    status character varying(50) NOT NULL,
    version character varying(50) NOT NULL,
    "registryUpdatedAt" timestamp(3) without time zone NOT NULL,
    data json DEFAULT '{}'::json NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CHK_tmp_mcp_registry_server_status" CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'deprecated'::character varying])::text[])))
);


ALTER TABLE public.mcp_registry_server OWNER TO postgres;

--
-- Name: COLUMN mcp_registry_server.status; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.mcp_registry_server.status IS 'Server status in the MCP registry. Deprecated servers are not surfaced to users.';


--
-- Name: COLUMN mcp_registry_server.data; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.mcp_registry_server.data IS 'JSON object containing server metadata (icons, remotes, tools, etc.)';


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.migrations OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.migrations_id_seq OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: oauth_access_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.oauth_access_tokens (
    token character varying NOT NULL,
    "clientId" character varying NOT NULL,
    "userId" uuid NOT NULL
);


ALTER TABLE public.oauth_access_tokens OWNER TO postgres;

--
-- Name: oauth_authorization_codes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.oauth_authorization_codes (
    code character varying(255) NOT NULL,
    "clientId" character varying NOT NULL,
    "userId" uuid NOT NULL,
    "redirectUri" character varying NOT NULL,
    "codeChallenge" character varying NOT NULL,
    "codeChallengeMethod" character varying(255) NOT NULL,
    "expiresAt" bigint NOT NULL,
    state character varying,
    used boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    resource character varying,
    scope json DEFAULT '["tool:listWorkflows","tool:getWorkflowDetails"]'::json NOT NULL
);


ALTER TABLE public.oauth_authorization_codes OWNER TO postgres;

--
-- Name: COLUMN oauth_authorization_codes."expiresAt"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.oauth_authorization_codes."expiresAt" IS 'Unix timestamp in milliseconds';


--
-- Name: COLUMN oauth_authorization_codes.resource; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.oauth_authorization_codes.resource IS 'RFC 8707 resource indicator URI (e.g. https://n8n.example.com/mcp-server/http). NULL = legacy flow predating resource indicator support; defaults to the instance canonical MCP resource URL.';


--
-- Name: COLUMN oauth_authorization_codes.scope; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.oauth_authorization_codes.scope IS 'OAuth scopes granted for this authorization code';


--
-- Name: oauth_clients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.oauth_clients (
    id character varying NOT NULL,
    name character varying(255) NOT NULL,
    "redirectUris" json NOT NULL,
    "grantTypes" json NOT NULL,
    "clientSecret" character varying(255),
    "clientSecretExpiresAt" bigint,
    "tokenEndpointAuthMethod" character varying(255) DEFAULT 'none'::character varying NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL
);


ALTER TABLE public.oauth_clients OWNER TO postgres;

--
-- Name: COLUMN oauth_clients."tokenEndpointAuthMethod"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.oauth_clients."tokenEndpointAuthMethod" IS 'Possible values: none, client_secret_basic or client_secret_post';


--
-- Name: oauth_refresh_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.oauth_refresh_tokens (
    token character varying(255) NOT NULL,
    "clientId" character varying NOT NULL,
    "userId" uuid NOT NULL,
    "expiresAt" bigint NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    scope json DEFAULT '["tool:listWorkflows","tool:getWorkflowDetails"]'::json NOT NULL
);


ALTER TABLE public.oauth_refresh_tokens OWNER TO postgres;

--
-- Name: COLUMN oauth_refresh_tokens."expiresAt"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.oauth_refresh_tokens."expiresAt" IS 'Unix timestamp in milliseconds';


--
-- Name: COLUMN oauth_refresh_tokens.scope; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.oauth_refresh_tokens.scope IS 'OAuth scopes granted for this refresh token';


--
-- Name: oauth_user_consents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.oauth_user_consents (
    id integer NOT NULL,
    "userId" uuid NOT NULL,
    "clientId" character varying NOT NULL,
    "grantedAt" bigint NOT NULL
);


ALTER TABLE public.oauth_user_consents OWNER TO postgres;

--
-- Name: COLUMN oauth_user_consents."grantedAt"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.oauth_user_consents."grantedAt" IS 'Unix timestamp in milliseconds';


--
-- Name: oauth_user_consents_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.oauth_user_consents ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.oauth_user_consents_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: processed_data; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.processed_data (
    "workflowId" character varying(36) NOT NULL,
    context character varying(255) NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    value text NOT NULL
);


ALTER TABLE public.processed_data OWNER TO postgres;

--
-- Name: project; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project (
    id character varying(36) NOT NULL,
    name character varying(255) NOT NULL,
    type character varying(36) NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    icon json,
    description character varying(512),
    "creatorId" uuid,
    "customTelemetryTags" json DEFAULT '[]'::json NOT NULL
);


ALTER TABLE public.project OWNER TO postgres;

--
-- Name: COLUMN project."creatorId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.project."creatorId" IS 'ID of the user who created the project';


--
-- Name: project_relation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_relation (
    "projectId" character varying(36) NOT NULL,
    "userId" uuid NOT NULL,
    role character varying NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL
);


ALTER TABLE public.project_relation OWNER TO postgres;

--
-- Name: project_secrets_provider_access; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_secrets_provider_access (
    "secretsProviderConnectionId" integer NOT NULL,
    "projectId" character varying(36) NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    role character varying(128) DEFAULT 'secretsProviderConnection:user'::character varying NOT NULL,
    CONSTRAINT "CHK_project_secrets_provider_access_role" CHECK (((role)::text = ANY ((ARRAY['secretsProviderConnection:owner'::character varying, 'secretsProviderConnection:user'::character varying])::text[])))
);


ALTER TABLE public.project_secrets_provider_access OWNER TO postgres;

--
-- Name: role; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role (
    slug character varying(128) NOT NULL,
    "displayName" text,
    description text,
    "roleType" text,
    "systemRole" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL
);


ALTER TABLE public.role OWNER TO postgres;

--
-- Name: COLUMN role.slug; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.role.slug IS 'Unique identifier of the role for example: "global:owner"';


--
-- Name: COLUMN role."displayName"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.role."displayName" IS 'Name used to display in the UI';


--
-- Name: COLUMN role.description; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.role.description IS 'Text describing the scope in more detail of users';


--
-- Name: COLUMN role."roleType"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.role."roleType" IS 'Type of the role, e.g., global, project, or workflow';


--
-- Name: COLUMN role."systemRole"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.role."systemRole" IS 'Indicates if the role is managed by the system and cannot be edited';


--
-- Name: role_mapping_rule; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_mapping_rule (
    id character varying(16) NOT NULL,
    expression text NOT NULL,
    role character varying(128) NOT NULL,
    type character varying(64) NOT NULL,
    "order" integer NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL
);


ALTER TABLE public.role_mapping_rule OWNER TO postgres;

--
-- Name: COLUMN role_mapping_rule.type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.role_mapping_rule.type IS 'Expected values: ''instance'' (maps to a global role) or ''project'' (maps to a project role; projects linked via role_mapping_rule_project).';


--
-- Name: role_mapping_rule_project; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_mapping_rule_project (
    "roleMappingRuleId" character varying(16) NOT NULL,
    "projectId" character varying(36) NOT NULL
);


ALTER TABLE public.role_mapping_rule_project OWNER TO postgres;

--
-- Name: role_scope; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_scope (
    "roleSlug" character varying(128) NOT NULL,
    "scopeSlug" character varying(128) NOT NULL
);


ALTER TABLE public.role_scope OWNER TO postgres;

--
-- Name: scope; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.scope (
    slug character varying(128) NOT NULL,
    "displayName" text,
    description text
);


ALTER TABLE public.scope OWNER TO postgres;

--
-- Name: COLUMN scope.slug; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.scope.slug IS 'Unique identifier of the scope for example: "project:create"';


--
-- Name: COLUMN scope."displayName"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.scope."displayName" IS 'Name used to display in the UI';


--
-- Name: COLUMN scope.description; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.scope.description IS 'Text describing the scope in more detail of users';


--
-- Name: secrets_provider_connection; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.secrets_provider_connection (
    id integer NOT NULL,
    "providerKey" character varying(128) NOT NULL,
    type character varying(36) NOT NULL,
    "encryptedSettings" text NOT NULL,
    "isEnabled" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL
);


ALTER TABLE public.secrets_provider_connection OWNER TO postgres;

--
-- Name: COLUMN secrets_provider_connection.type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.secrets_provider_connection.type IS 'Type of secrets provider. Possible values: awsSecretsManager, gcpSecretsManager, vault, azureKeyVault, infisical';


--
-- Name: secrets_provider_connection_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.secrets_provider_connection ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.secrets_provider_connection_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.settings (
    key character varying(255) NOT NULL,
    value text NOT NULL,
    "loadOnStartup" boolean DEFAULT false NOT NULL
);


ALTER TABLE public.settings OWNER TO postgres;

--
-- Name: shared_credentials; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shared_credentials (
    "credentialsId" character varying(36) NOT NULL,
    "projectId" character varying(36) NOT NULL,
    role text NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL
);


ALTER TABLE public.shared_credentials OWNER TO postgres;

--
-- Name: shared_workflow; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shared_workflow (
    "workflowId" character varying(36) NOT NULL,
    "projectId" character varying(36) NOT NULL,
    role text NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL
);


ALTER TABLE public.shared_workflow OWNER TO postgres;

--
-- Name: tag_entity; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tag_entity (
    name character varying(24) NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    id character varying(36) NOT NULL
);


ALTER TABLE public.tag_entity OWNER TO postgres;

--
-- Name: test_case_execution; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.test_case_execution (
    id character varying(36) NOT NULL,
    "testRunId" character varying(36) NOT NULL,
    "executionId" integer,
    status character varying NOT NULL,
    "runAt" timestamp(3) with time zone,
    "completedAt" timestamp(3) with time zone,
    "errorCode" character varying,
    "errorDetails" json,
    metrics json,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    inputs json,
    outputs json,
    "runIndex" integer
);


ALTER TABLE public.test_case_execution OWNER TO postgres;

--
-- Name: test_run; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.test_run (
    id character varying(36) NOT NULL,
    "workflowId" character varying(36) NOT NULL,
    status character varying NOT NULL,
    "errorCode" character varying,
    "errorDetails" json,
    "runAt" timestamp(3) with time zone,
    "completedAt" timestamp(3) with time zone,
    metrics json,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "runningInstanceId" character varying(255),
    "cancelRequested" boolean DEFAULT false NOT NULL,
    "workflowVersionId" character varying(36),
    "evaluationConfigId" character varying(36),
    "evaluationConfigSnapshot" jsonb,
    "collectionId" character varying(36)
);


ALTER TABLE public.test_run OWNER TO postgres;

--
-- Name: token_exchange_jti; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.token_exchange_jti (
    jti character varying(255) NOT NULL,
    "expiresAt" timestamp(3) with time zone NOT NULL,
    "createdAt" timestamp(3) with time zone NOT NULL
);


ALTER TABLE public.token_exchange_jti OWNER TO postgres;

--
-- Name: trusted_key; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trusted_key (
    "sourceId" character varying(36) NOT NULL,
    kid character varying(255) NOT NULL,
    data text NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL
);


ALTER TABLE public.trusted_key OWNER TO postgres;

--
-- Name: trusted_key_source; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trusted_key_source (
    id character varying(36) NOT NULL,
    type character varying(32) NOT NULL,
    config text NOT NULL,
    status character varying(32) DEFAULT 'pending'::character varying NOT NULL,
    "lastError" text,
    "lastRefreshedAt" timestamp(3) with time zone,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL
);


ALTER TABLE public.trusted_key_source OWNER TO postgres;

--
-- Name: user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."user" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying(255),
    "firstName" character varying(32),
    "lastName" character varying(32),
    password character varying(255),
    "personalizationAnswers" json,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    settings json,
    disabled boolean DEFAULT false NOT NULL,
    "mfaEnabled" boolean DEFAULT false NOT NULL,
    "mfaSecret" text,
    "mfaRecoveryCodes" text,
    "lastActiveAt" date,
    "roleSlug" character varying(128) DEFAULT 'global:member'::character varying NOT NULL
);


ALTER TABLE public."user" OWNER TO postgres;

--
-- Name: user_api_keys; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_api_keys (
    id character varying(36) NOT NULL,
    "userId" uuid NOT NULL,
    label character varying(100) NOT NULL,
    "apiKey" character varying NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    scopes json,
    audience character varying DEFAULT 'public-api'::character varying NOT NULL,
    "lastUsedAt" timestamp(3) with time zone
);


ALTER TABLE public.user_api_keys OWNER TO postgres;

--
-- Name: user_favorites; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_favorites (
    id integer NOT NULL,
    "userId" uuid NOT NULL,
    "resourceId" character varying(255) NOT NULL,
    "resourceType" character varying(64) NOT NULL
);


ALTER TABLE public.user_favorites OWNER TO postgres;

--
-- Name: user_favorites_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.user_favorites ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.user_favorites_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: variables; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.variables (
    key character varying(50) NOT NULL,
    type character varying(50) DEFAULT 'string'::character varying NOT NULL,
    value text,
    id character varying(36) NOT NULL,
    "projectId" character varying(36),
    CONSTRAINT variables_value_max_len CHECK (((value IS NULL) OR (char_length(value) <= 1000)))
);


ALTER TABLE public.variables OWNER TO postgres;

--
-- Name: webhook_entity; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.webhook_entity (
    "webhookPath" character varying NOT NULL,
    method character varying NOT NULL,
    node character varying NOT NULL,
    "webhookId" character varying,
    "pathLength" integer,
    "workflowId" character varying(36) NOT NULL
);


ALTER TABLE public.webhook_entity OWNER TO postgres;

--
-- Name: workflow_builder_session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workflow_builder_session (
    id uuid NOT NULL,
    "workflowId" character varying(36) NOT NULL,
    "userId" uuid NOT NULL,
    messages json DEFAULT '[]'::json NOT NULL,
    "previousSummary" text,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "activeVersionCardId" character varying(255),
    "resumeAfterRestoreMessageId" character varying(255)
);


ALTER TABLE public.workflow_builder_session OWNER TO postgres;

--
-- Name: COLUMN workflow_builder_session."previousSummary"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.workflow_builder_session."previousSummary" IS 'Summary of prior conversation from compaction (/compact or auto-compact)';


--
-- Name: workflow_dependency; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workflow_dependency (
    id integer NOT NULL,
    "workflowId" character varying(36) NOT NULL,
    "workflowVersionId" integer NOT NULL,
    "dependencyType" character varying(32) NOT NULL,
    "dependencyKey" character varying(255) NOT NULL,
    "dependencyInfo" json,
    "indexVersionId" smallint DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "publishedVersionId" character varying(36)
);


ALTER TABLE public.workflow_dependency OWNER TO postgres;

--
-- Name: COLUMN workflow_dependency."workflowVersionId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.workflow_dependency."workflowVersionId" IS 'Version of the workflow';


--
-- Name: COLUMN workflow_dependency."dependencyType"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.workflow_dependency."dependencyType" IS 'Type of dependency: "credential", "nodeType", "webhookPath", or "workflowCall"';


--
-- Name: COLUMN workflow_dependency."dependencyKey"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.workflow_dependency."dependencyKey" IS 'ID or name of the dependency';


--
-- Name: COLUMN workflow_dependency."dependencyInfo"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.workflow_dependency."dependencyInfo" IS 'Additional info about the dependency, interpreted based on type';


--
-- Name: COLUMN workflow_dependency."indexVersionId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.workflow_dependency."indexVersionId" IS 'Version of the index structure';


--
-- Name: workflow_dependency_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.workflow_dependency ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.workflow_dependency_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: workflow_entity; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workflow_entity (
    name character varying(128) NOT NULL,
    active boolean NOT NULL,
    nodes json NOT NULL,
    connections json NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    settings json,
    "staticData" json,
    "pinData" json,
    "versionId" character(36) NOT NULL,
    "triggerCount" integer DEFAULT 0 NOT NULL,
    id character varying(36) NOT NULL,
    meta json,
    "parentFolderId" character varying(36) DEFAULT NULL::character varying,
    "isArchived" boolean DEFAULT false NOT NULL,
    "versionCounter" integer DEFAULT 1 NOT NULL,
    description text,
    "activeVersionId" character varying(36),
    "nodeGroups" json DEFAULT '[]'::json NOT NULL,
    "sourceWorkflowId" character varying
);


ALTER TABLE public.workflow_entity OWNER TO postgres;

--
-- Name: workflow_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workflow_history (
    "versionId" character varying(36) NOT NULL,
    "workflowId" character varying(36) NOT NULL,
    authors character varying(255) NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    nodes json NOT NULL,
    connections json NOT NULL,
    name character varying(128),
    autosaved boolean DEFAULT false NOT NULL,
    description text,
    "nodeGroups" json DEFAULT '[]'::json NOT NULL
);


ALTER TABLE public.workflow_history OWNER TO postgres;

--
-- Name: workflow_publication_outbox; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workflow_publication_outbox (
    id integer NOT NULL,
    "workflowId" character varying(36) NOT NULL,
    "publishedVersionId" character varying(36) NOT NULL,
    status character varying(20) NOT NULL,
    "errorMessage" text,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CHK_workflow_publication_outbox_status" CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'in_progress'::character varying, 'completed'::character varying, 'partial_success'::character varying, 'failed'::character varying])::text[])))
);


ALTER TABLE public.workflow_publication_outbox OWNER TO postgres;

--
-- Name: COLUMN workflow_publication_outbox."workflowId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.workflow_publication_outbox."workflowId" IS 'References workflow_entity.id.';


--
-- Name: COLUMN workflow_publication_outbox."publishedVersionId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.workflow_publication_outbox."publishedVersionId" IS 'References workflow_history.versionId.';


--
-- Name: COLUMN workflow_publication_outbox."errorMessage"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.workflow_publication_outbox."errorMessage" IS 'Error details for surfacing failed publications to the user.';


--
-- Name: workflow_publication_outbox_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.workflow_publication_outbox ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.workflow_publication_outbox_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: workflow_publish_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workflow_publish_history (
    id integer NOT NULL,
    "workflowId" character varying(36) NOT NULL,
    "versionId" character varying(36),
    event character varying(36) NOT NULL,
    "userId" uuid,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CHK_workflow_publish_history_event" CHECK (((event)::text = ANY ((ARRAY['activated'::character varying, 'deactivated'::character varying])::text[])))
);


ALTER TABLE public.workflow_publish_history OWNER TO postgres;

--
-- Name: COLUMN workflow_publish_history.event; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.workflow_publish_history.event IS 'Type of history record: activated (workflow is now active), deactivated (workflow is now inactive)';


--
-- Name: workflow_publish_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.workflow_publish_history ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.workflow_publish_history_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: workflow_published_version; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workflow_published_version (
    "workflowId" character varying(36) NOT NULL,
    "publishedVersionId" character varying(36) NOT NULL,
    "createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL,
    "updatedAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP(3) NOT NULL
);


ALTER TABLE public.workflow_published_version OWNER TO postgres;

--
-- Name: workflow_statistics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workflow_statistics (
    count bigint DEFAULT 0,
    "latestEvent" timestamp(3) with time zone,
    name character varying(128) NOT NULL,
    "workflowId" character varying(36) NOT NULL,
    "rootCount" bigint DEFAULT 0,
    id integer NOT NULL,
    "workflowName" character varying(128)
);


ALTER TABLE public.workflow_statistics OWNER TO postgres;

--
-- Name: workflow_statistics_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.workflow_statistics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.workflow_statistics_id_seq OWNER TO postgres;

--
-- Name: workflow_statistics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.workflow_statistics_id_seq OWNED BY public.workflow_statistics.id;


--
-- Name: workflows_tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workflows_tags (
    "workflowId" character varying(36) NOT NULL,
    "tagId" character varying(36) NOT NULL
);


ALTER TABLE public.workflows_tags OWNER TO postgres;

--
-- Name: auth_provider_sync_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_provider_sync_history ALTER COLUMN id SET DEFAULT nextval('public.auth_provider_sync_history_id_seq'::regclass);


--
-- Name: execution_annotations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.execution_annotations ALTER COLUMN id SET DEFAULT nextval('public.execution_annotations_id_seq'::regclass);


--
-- Name: execution_entity id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.execution_entity ALTER COLUMN id SET DEFAULT nextval('public.execution_entity_id_seq'::regclass);


--
-- Name: execution_metadata id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.execution_metadata ALTER COLUMN id SET DEFAULT nextval('public.execution_metadata_temp_id_seq'::regclass);


--
-- Name: instance_version_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instance_version_history ALTER COLUMN id SET DEFAULT nextval('public.instance_version_history_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: workflow_statistics id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_statistics ALTER COLUMN id SET DEFAULT nextval('public.workflow_statistics_id_seq'::regclass);


--
-- Data for Name: agent_chat_subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.agent_chat_subscriptions ("agentId", "integrationType", "credentialId", "threadId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: agent_checkpoints; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.agent_checkpoints ("runId", "agentId", state, expired, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: agent_execution; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.agent_execution (id, "threadId", status, "startedAt", "stoppedAt", duration, "userMessage", "assistantResponse", model, "promptTokens", "completionTokens", "totalTokens", cost, "toolCalls", timeline, error, "hitlStatus", source, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: agent_execution_threads; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.agent_execution_threads (id, "agentId", "agentName", "projectId", "sessionNumber", "totalPromptTokens", "totalCompletionTokens", "totalCost", "totalDuration", title, emoji, "createdAt", "updatedAt", "taskId", "taskVersionId", "parentThreadId", "parentAgentId") FROM stdin;
\.


--
-- Data for Name: agent_files; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.agent_files (id, "agentId", "binaryDataId", "fileName", "mimeType", "fileSizeBytes", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: agent_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.agent_history ("versionId", "agentId", schema, tools, skills, "publishedById", author, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: agent_task_definition; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.agent_task_definition (id, "agentId", name, objective, "cronExpression", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: agent_task_run_lock; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.agent_task_run_lock ("agentId", "taskId", "holderId", "heldUntil", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: agent_task_snapshot; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.agent_task_snapshot ("versionId", "taskId", enabled, name, objective, "cronExpression", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: agents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.agents (id, name, description, "projectId", integrations, schema, tools, skills, "versionId", "createdAt", "updatedAt", "activeVersionId") FROM stdin;
\.


--
-- Data for Name: agents_memory_entries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.agents_memory_entries (id, "agentId", "resourceId", content, "contentHash", status, "supersededBy", "embeddingModel", embedding, metadata, "lastSeenAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: agents_memory_entry_cursors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.agents_memory_entry_cursors ("agentId", "observationScopeId", "lastIndexedObservationId", "lastIndexedObservationCreatedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: agents_memory_entry_locks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.agents_memory_entry_locks ("agentId", "resourceId", "holderId", "heldUntil", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: agents_memory_entry_sources; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.agents_memory_entry_sources (id, "agentId", "memoryEntryId", "observationId", "threadId", "evidenceHash", "evidenceText", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: agents_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.agents_messages (id, "threadId", "resourceId", role, type, content, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: agents_observation_cursors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.agents_observation_cursors ("agentId", "observationScopeId", "lastObservedMessageId", "lastObservedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: agents_observation_locks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.agents_observation_locks ("agentId", "observationScopeId", "taskKind", "holderId", "heldUntil", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: agents_observations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.agents_observations (id, "agentId", "observationScopeId", marker, text, "parentId", "tokenCount", status, "supersededBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: agents_resources; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.agents_resources (id, metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: agents_threads; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.agents_threads (id, "resourceId", title, metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ai_builder_temporary_workflow; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ai_builder_temporary_workflow ("workflowId", "threadId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: annotation_tag_entity; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.annotation_tag_entity (id, name, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: auth_identity; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth_identity ("userId", "providerId", "providerType", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: auth_provider_sync_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth_provider_sync_history (id, "providerType", "runMode", status, "startedAt", "endedAt", scanned, created, updated, disabled, error) FROM stdin;
\.


--
-- Data for Name: binary_data; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.binary_data ("fileId", "sourceType", "sourceId", data, "mimeType", "fileName", "fileSize", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: chat_hub_agent_tools; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chat_hub_agent_tools ("agentId", "toolId") FROM stdin;
\.


--
-- Data for Name: chat_hub_agents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chat_hub_agents (id, name, description, "systemPrompt", "ownerId", "credentialId", provider, model, "createdAt", "updatedAt", icon, files, "suggestedPrompts") FROM stdin;
\.


--
-- Data for Name: chat_hub_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chat_hub_messages (id, "sessionId", "previousMessageId", "revisionOfMessageId", "retryOfMessageId", type, name, content, provider, model, "workflowId", "executionId", "createdAt", "updatedAt", "agentId", status, attachments) FROM stdin;
\.


--
-- Data for Name: chat_hub_session_tools; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chat_hub_session_tools ("sessionId", "toolId") FROM stdin;
\.


--
-- Data for Name: chat_hub_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chat_hub_sessions (id, title, "ownerId", "lastMessageAt", "credentialId", provider, model, "workflowId", "createdAt", "updatedAt", "agentId", "agentName", type) FROM stdin;
\.


--
-- Data for Name: chat_hub_tools; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chat_hub_tools (id, name, type, "typeVersion", "ownerId", definition, enabled, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: credential_dependency; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.credential_dependency (id, "credentialId", "dependencyType", "dependencyId", "createdAt") FROM stdin;
\.


--
-- Data for Name: credentials_entity; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.credentials_entity (name, data, type, "createdAt", "updatedAt", id, "isManaged", "isGlobal", "isResolvable", "resolvableAllowFallback", "resolverId") FROM stdin;
\.


--
-- Data for Name: data_table; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.data_table (id, name, "projectId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: data_table_column; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.data_table_column (id, name, type, index, "dataTableId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: deployment_key; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.deployment_key (id, type, value, algorithm, status, "createdAt", "updatedAt") FROM stdin;
CzsjTnqw60eOJ721	instance.id	a83e255383bbd6723b87c033711127a1f51c15f181ea52474ea79774d1c7c253	\N	active	2026-06-30 16:29:55.12+00	2026-06-30 16:29:55.12+00
nDRepQ0EyU3YE6HG	signing.hmac	62d596a8d9f1b5cb08579530dc4b26ca504ad5fd2e47dd0fe9c89da864c3997f	\N	active	2026-06-30 16:29:55.122+00	2026-06-30 16:29:55.122+00
YxUFfNEfoJhzQpkI	signing.jwt	24ed2cc273b29d8483e436452dbad1ac3e7ba4d6b234255167b611c357a7d2fb	\N	active	2026-06-30 16:29:55.124+00	2026-06-30 16:29:55.124+00
8AOnQMvcrEtNor1l	signing.binary_data	DLrmYzNr+a0flk9596ZFcbufTa09X7NHESM6NBL5akc=	\N	active	2026-06-30 16:29:55.126+00	2026-06-30 16:29:55.126+00
\.


--
-- Data for Name: dynamic_credential_entry; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dynamic_credential_entry (credential_id, subject_id, resolver_id, data, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: dynamic_credential_resolver; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dynamic_credential_resolver (id, name, type, config, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: dynamic_credential_user_entry; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dynamic_credential_user_entry ("credentialId", "userId", "resolverId", data, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: evaluation_collection; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.evaluation_collection (id, name, description, "workflowId", "evaluationConfigId", "createdById", "insightsCache", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: evaluation_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.evaluation_config (id, "workflowId", name, status, "invalidReason", "datasetSource", "datasetRef", "startNodeName", "endNodeName", metrics, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: event_destinations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.event_destinations (id, destination, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: execution_annotation_tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.execution_annotation_tags ("annotationId", "tagId") FROM stdin;
\.


--
-- Data for Name: execution_annotations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.execution_annotations (id, "executionId", vote, note, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: execution_data; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.execution_data ("executionId", "workflowData", data, "workflowVersionId") FROM stdin;
1	{"id":"Si28JZdUotdLzill","name":"My workflow","nodes":[{"parameters":{"notice":"","rule":{"interval":[{"field":"minutes","minutesInterval":15},{"field":"days","daysInterval":1,"triggerAtHour":0,"triggerAtMinute":0}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"}],"connections":{},"settings":{"executionOrder":"v1","binaryMode":"separate","availableInMCP":false}}	[{"version":1,"startData":"1","resultData":"2","executionData":"3","resumeToken":"4"},{"destinationNode":"5","runNodeFilter":"6"},{"runData":"7","pinData":"8","lastNodeExecuted":"9"},{"contextData":"10","nodeExecutionStack":"11","metadata":"12","waitingExecution":"13","waitingExecutionSource":"14","runtimeData":"15"},"2c09153d294b9c7ed5a32eefe7e955748e82cfd1257f3a7d4354635bd70a7b6a",{"nodeName":"9","mode":"16"},["9"],{"Schedule Trigger":"17"},{},"Schedule Trigger",{},[],{},{},{},{"version":1,"establishedAt":1782837922652,"source":"18","triggerNode":"19","redaction":"20","credentials":"21"},"inclusive",["22"],"manual",{"name":"9","type":"23"},{"version":2,"production":false,"manual":false,"source":"24"},"U2FsdGVkX19COF/vGDnX0jjUFVnIa2TCIObFlO8u6SVo6A9BeCx5nudytAoDf5MLX1BfanzcsAEmuXxrPSrMr62h/r0tqtcIV/QRQnmIcJVdZSsQ3Jx/vcnOdJX21AY/oizGZ7AqZIUNI9cFPQdF07OpxcE9XrjMtxXY0Nts9wjQGxAPrXXi6/TzTdPkhMJh68rv3DEO1gDpkM2b4pu2yYbdSbswrIQ28iNJvopzrsYwMz6qyju9xLWuDdST2OIly5z59SHRrgK9YWMaowdQ1m1JDWoOMYcNgeULbEboUZnV3yTNvpZKDrt5FKqXC60ZYCthjzfOU/pCGjK8ekEjV0qn45t8fYY4Ecc9VmxfF14x+t3zn64XpxuW7K1EANqBWVTQOnk3Kxjhen2A4xnQcYiu1h+1F27DdOCWDQwdlzf7uSE5OI+234DD3cNeAhUqy2xVyoWm1B9p3L6oXEDpCnRPgR1pEf+KMT7m0D2uDXeavUCnoL0MThzUItOx59TMjTC63sUj82SfTs3NjVRdIw==",{"startTime":1782837922660,"executionIndex":0,"source":"25","hints":"26","executionTime":4,"executionStatus":"27","data":"28"},"n8n-nodes-base.scheduleTrigger","workflow",[],[],"success",{"main":"29"},["30"],["31"],{"json":"32","pairedItem":"33"},{"timestamp":"34","Readable date":"35","Readable time":"36","Day of week":"37","Year":"38","Month":"39","Day of month":"40","Hour":"41","Minute":"42","Second":"43","Timezone":"44"},{"item":0},"2026-06-30T23:45:22.662+07:00","June 30th 2026, 11:45:22 pm","11:45:22 pm","Tuesday","2026","June","30","23","45","22","Asia/Bangkok (UTC+07:00)"]	c8bb8017-a4a4-40e5-98a5-468bf5645db5
2	{"id":"Si28JZdUotdLzill","name":"My workflow","nodes":[{"parameters":{"notice":"","rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"}],"connections":{},"settings":{"executionOrder":"v1","binaryMode":"separate","availableInMCP":false}}	[{"version":1,"startData":"1","resultData":"2","executionData":"3","resumeToken":"4"},{},{"runData":"5","pinData":"6","lastNodeExecuted":"7"},{"contextData":"8","nodeExecutionStack":"9","metadata":"10","waitingExecution":"11","waitingExecutionSource":"12","runtimeData":"13"},"43513a3c3622036de8b137cdd66dcd36081ded95541914b7daf959bd50b99f90",{"Schedule Trigger":"14"},{},"Schedule Trigger",{},[],{},{},{},{"version":1,"establishedAt":1782838075711,"source":"15","triggerNode":"16","redaction":"17","credentials":"18"},["19"],"manual",{"name":"7","type":"20"},{"version":2,"production":false,"manual":false,"source":"21"},"U2FsdGVkX18mOK8LyMLh+Q2hHcocs+sX2Pz2hXDTxQ0U7hlbICEfvsSJxuPaxDyV6dpvLkCREyLCUDMPYiwfXM+7HzWRme4H6CETzQ4zJ5wzW9KAbSYP5khW7x8YR1R0bYTK5bbbULzVhQGCTAdVKquXM0N2o39YsOFFk6DP9POfiFTyvcmFPB+50odtW1vojy8sBDDlh/vKB6kL2nFXLQaefEVC7JEYwBIiua2Ux9e/se5N3+1iIlMo3qJ8gC0/6L7LLCF7KX9plhAokvt8W+Qm7EDXDZojeim88ic2jVVvg8Cl5J/E8DnduCJFdOGvT+M341BB7Q1OtT/QqTtQ8Dh3QZLlTKnUFmQ/sMeaHRwZLkTrA10PQARo4RdGwm7UalkOJrpQiwW1PQiFNCqxgNieXzQv5rnyFyH6vlEqzpdGDkh9ytbU7JHiybxTbsOSKMjjS2y6dr2suNodcxLGezGXvACSKtSpv5lOYs3rbapl525p5jlz+2/PIozIwe2Q0Y5z4yzoh0K7f6nCNiertA==",{"startTime":1782838075720,"executionIndex":0,"source":"22","hints":"23","executionTime":1,"executionStatus":"24","data":"25"},"n8n-nodes-base.scheduleTrigger","workflow",[],[],"success",{"main":"26"},["27"],["28"],{"json":"29","pairedItem":"30"},{"timestamp":"31","Readable date":"32","Readable time":"33","Day of week":"34","Year":"35","Month":"36","Day of month":"37","Hour":"38","Minute":"39","Second":"40","Timezone":"41"},{"item":0},"2026-06-30T23:47:55.721+07:00","June 30th 2026, 11:47:55 pm","11:47:55 pm","Tuesday","2026","June","30","23","47","55","Asia/Bangkok (UTC+07:00)"]	660e326a-406d-4cd3-b3a7-1c32f2770569
3	{"id":"Si28JZdUotdLzill","name":"My workflow","nodes":[{"parameters":{"notice":"","rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"}],"connections":{},"settings":{"executionOrder":"v1","binaryMode":"separate","availableInMCP":false}}	[{"version":1,"startData":"1","resultData":"2","executionData":"3","resumeToken":"4"},{},{"runData":"5","pinData":"6","lastNodeExecuted":"7"},{"contextData":"8","nodeExecutionStack":"9","metadata":"10","waitingExecution":"11","waitingExecutionSource":"12","runtimeData":"13"},"10786017513f92061f8c52009100df0db1a3339555ffea414cbfdebdc86dd76a",{"Schedule Trigger":"14"},{},"Schedule Trigger",{},[],{},{},{},{"version":1,"establishedAt":1782838078450,"source":"15","triggerNode":"16","redaction":"17","credentials":"18"},["19"],"manual",{"name":"7","type":"20"},{"version":2,"production":false,"manual":false,"source":"21"},"U2FsdGVkX1+l2161zOUhrLO8Xe+xjrlremhKcwNaAXD6Zm7oPNAcifOMtHWV+wp79U+AIYr5vaxAuHZWcPwJaqx/28pYAhF7FPakL4jivDzzZocLwc4L79SjD0WTqk4K1x33DwX0ZwVGsdTVu0BLN0q1KrwNwLLfzPWicwclN5bT4W19xpx/07lu33vyidpVM16Az5QQ1Ge+BJTdqFFeVwzeNM9lt9DIL/g4k1JboFXNS12G3oE7WJ8droQuCJhmVYSbEnmIy1SAeFokbtX+Q8dlp8FUE4lnmCVcqyCXWaIcnPJrF+pA5HC4cuy4lo0Zlsv7nEJ/s6MPedsK50IvB2sk4ab2i4e8ThnqTgW2s/aYIgXCQOpRmP+Fyoen7IfMYZnITDMmgl+dyV1gf2VX4EKZ+fVS6CpRXJxARtDZ0SKLlWzQQVo2wzfFg4yonjJQfucOopXNObYPpvs1q1Y+PHM717zy0oBNxdjMdJMXVOLCQEgdJuEtt3ys/cGhA0MT6QqJzthd4rWR396zMW6NxA==",{"startTime":1782838078458,"executionIndex":0,"source":"22","hints":"23","executionTime":1,"executionStatus":"24","data":"25"},"n8n-nodes-base.scheduleTrigger","workflow",[],[],"success",{"main":"26"},["27"],["28"],{"json":"29","pairedItem":"30"},{"timestamp":"31","Readable date":"32","Readable time":"33","Day of week":"34","Year":"35","Month":"36","Day of month":"37","Hour":"38","Minute":"39","Second":"40","Timezone":"41"},{"item":0},"2026-06-30T23:47:58.459+07:00","June 30th 2026, 11:47:58 pm","11:47:58 pm","Tuesday","2026","June","30","23","47","58","Asia/Bangkok (UTC+07:00)"]	660e326a-406d-4cd3-b3a7-1c32f2770569
4	{"id":"Si28JZdUotdLzill","name":"My workflow","nodes":[{"parameters":{"notice":"","rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"curlImport":"","method":"GET","url":"http://app:3000/api/content/scheduled","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":false,"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[144,32],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"}],"connections":{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]}},"settings":{"executionOrder":"v1","binaryMode":"separate","availableInMCP":false}}	[{"version":1,"startData":"1","resultData":"2","executionData":"3","resumeToken":"4"},{"destinationNode":"5","runNodeFilter":"6"},{"runData":"7","pinData":"8","lastNodeExecuted":"9"},{"contextData":"10","nodeExecutionStack":"11","metadata":"12","waitingExecution":"13","waitingExecutionSource":"14","runtimeData":"15"},"425bc3485f08f4e3e2767c65b18989a3a5088aee9b24316b4905eb03dfbb5cce",{"nodeName":"9","mode":"16"},["17","9"],{"Schedule Trigger":"18","HTTP Request":"19"},{},"HTTP Request",{"node:HTTP Request":"20"},[],{},{},{},{"version":1,"establishedAt":1782892305412,"source":"21","triggerNode":"22","redaction":"23","credentials":"24"},"inclusive","Schedule Trigger",["25"],["26"],{"response":"27"},"manual",{"name":"9","type":"28"},{"version":2,"production":false,"manual":false,"source":"29"},"U2FsdGVkX18ch83Vr0Q6rctoJ7etLH9hVYpXDi6XEcfUIqpa5c739ZgzHHbDNzTDLwr8i97SZNFt+7dqzDItvg5P9aePCBCzgXaSV7llaCtLnuyhcI7t1AJInB3xlTu3UscuKiuEKL+czBoR2KRQm6hnd9i+YJS0q76tRTwbJYk3zW7hJO/tv8aToH9zzGwuT4UOTMSUKCotWhXSKSAFUkqkzw5quKiCBleiNSVij7OQOGl8lRr9Yawy9JBEK0eufImXErCt3enNDbIbmXLjjOPR9k/ZhpdzGO/9yQcU5MSdvGAGlVY0oNQcq8LtbNyRXD06CvgsQBql2lFNgrkgTAMkY3UzKdgCbaTGI+XIppD1cYHDT3RAoIjy/zIP0p0QEHUNepxlabmoHDTycAZ+3sUDP/vaFgktl/ARdlLWnppVHr41woZprbDn4fwGd0bbjVhmb8M0s81pxUkBkqv+zgvERblATG3UF0nLE2xEgaYKvuBOqDp9LGqZjYasvY5q16+933Ycpt84N19rMolxXA==",{"startTime":1782838078458,"executionIndex":0,"source":"30","hints":"31","executionTime":1,"executionStatus":"32","data":"33"},{"startTime":1782892305418,"executionIndex":1,"source":"34","hints":"35","executionTime":51,"executionStatus":"32","data":"36"},{"body":"37"},"n8n-nodes-base.httpRequest","workflow",[],[],"success",{"main":"38"},["39"],[],{"main":"40"},{"count":1,"items":"41"},["42"],{"previousNode":"17","previousNodeOutput":0,"previousNodeRun":0},["43"],["44"],["45"],["46"],{"id":"47","contentId":"48","name":"49","mediaType":"50","channel":"51","platforms":"52","details":"53","location":"54","scheduledDate":"55","scheduledTime":"56","endTime":"57","team":"58","productsNeeded":"59","itemsToPrepare":"60","attachments":"61","script":"62","ideaCreator":"63","photographer":"64","editor":"65","status":"66","category":"67","tags":"68","createdAt":"69"},{"json":"70","pairedItem":"71"},{"json":"37","pairedItem":"72"},"cmr1rufqi00035auii7ehwyie","10001","Hero Serum Launch Video","video","Official",["73","74","75"],"วิดีโอเปิดตัว Hero Serum สไตล์ lifestyle herbal","Studio A","2026-06-15","10:00","12:00",["76","77"],["78"],"Backdrop สีเขียว, Props สมุนไพร",[],["79"],"Laura Power","พิมพ์ใจ ถ่ายทำ","กนก ตัดต่อ","approved","Hero Video",["80"],"2026-07-01T07:46:09.066Z",{"timestamp":"81","Readable date":"82","Readable time":"83","Day of week":"84","Year":"85","Month":"86","Day of month":"87","Hour":"88","Minute":"89","Second":"90","Timezone":"91"},{"item":0},{"item":0},"facebook","instagram","tiktok",{"id":"92","participant":"63","responsibility":"93"},{"id":"94","participant":"95","responsibility":"96"},"Hero Serum",{"id":"97","notes":"98","action":"99","dialogue":"100","duration":"101"},"Hero Product","2026-06-30T23:47:58.459+07:00","June 30th 2026, 11:47:58 pm","11:47:58 pm","Tuesday","2026","June","30","23","47","58","Asia/Bangkok (UTC+07:00)","1","Presenter","2","วิชัย สร้างสรรค์","Camera","s1","Close-up macro","Open with product shot","สวัสดีค่ะ วันนี้มาแนะนำ Hero Serum","0:00-0:15"]	9ab8985d-247a-4665-a8d7-7336c8564203
5	{"id":"Si28JZdUotdLzill","name":"content post","nodes":[{"parameters":{"notice":"","rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"curlImport":"","method":"GET","url":"http://app:3000/api/content/scheduled","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":false,"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"fieldToSplitOut":"items","include":"noOtherFields","options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"}],"connections":{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]}},"settings":{"executionOrder":"v1","binaryMode":"separate","availableInMCP":false}}	[{"version":1,"startData":"1","resultData":"2","executionData":"3","resumeToken":"4"},{"destinationNode":"5","runNodeFilter":"6"},{"runData":"7","pinData":"8","lastNodeExecuted":"9"},{"contextData":"10","nodeExecutionStack":"11","metadata":"12","waitingExecution":"13","waitingExecutionSource":"14","runtimeData":"15"},"8e2f662b1fc78aea66a590bf9acaa8bed0c59be4304ef12fae1cdc4260d32017",{"nodeName":"9","mode":"16"},["17","18","9"],{"Schedule Trigger":"19","HTTP Request":"20","Split Out":"21"},{},"Split Out",{},[],{},{},{},{"version":1,"establishedAt":1782892827663,"source":"22","triggerNode":"23","redaction":"24","credentials":"25"},"inclusive","Schedule Trigger","HTTP Request",["26"],["27"],["28"],"manual",{"name":"9","type":"29"},{"version":2,"production":false,"manual":false,"source":"30"},"U2FsdGVkX19pbFDGbJRnnASD+3/shU+m7nl2Kfus8X6jo1gozkignsD9VwybVUf69fHAuYX5HsKZPZPe4/8Qq616zWOoOhBq2F5qOqeK7DyFR4M5TtoNEHRZomDgqvRdX3P5LCZNLpn/lYBrRYFMDqz9hVMOcYEeX8DNW3r8oxA5z23qLzpZOlUu/zuWjuznQNOYk3Jf7HSmy39xxISvOGX7QSxGloKWUTzjGU5c6gyF61CdEaEAo11TtTiABgRrXBFmNdzgbJeemEGefrMhD36P+A89H2c1ymPRW6+p4hMzs9ZcdEwL9T53apOXyGAOUUzfcImlSNeBNxmD4THNKQpGiN5XhXYaYe3xJto2K5r/K6/oyz2A40DL/OC919LBuqf48rO+FVN6DiOaESyOau4jm+aQ+Kutx8O+CPYdHIke8laBSTGR0fs1rc06fs2132w0XRp0tNHL96FleF557B5cA8DTCOrukv9ocHo83RtZ7WHyABBAyGfvqnaGud6WekEsjHJmfd7Sy1NfH8hdtg==",{"startTime":1782838078458,"executionIndex":0,"source":"31","hints":"32","executionTime":1,"executionStatus":"33","data":"34"},{"startTime":1782892305418,"executionIndex":1,"source":"35","hints":"36","executionTime":51,"executionStatus":"33","data":"37"},{"startTime":1782892827672,"executionIndex":2,"source":"38","hints":"39","executionTime":2,"executionStatus":"33","data":"40"},"n8n-nodes-base.splitOut","workflow",[],[],"success",{"main":"41"},["42"],[],{"main":"43"},["44"],[],{"main":"45"},["46"],{"previousNode":"17","previousNodeOutput":0,"previousNodeRun":0},["47"],{"previousNode":"18","previousNodeOutput":0,"previousNodeRun":0},["48"],["49"],["50"],["51"],{"json":"52","pairedItem":"53"},{"json":"54","pairedItem":"55"},{"json":"56","pairedItem":"57"},{"timestamp":"58","Readable date":"59","Readable time":"60","Day of week":"61","Year":"62","Month":"63","Day of month":"64","Hour":"65","Minute":"66","Second":"67","Timezone":"68"},{"item":0},{"count":1,"items":"69"},{"item":0},{"id":"70","contentId":"71","name":"72","mediaType":"73","channel":"74","platforms":"75","details":"76","location":"77","scheduledDate":"78","scheduledTime":"79","endTime":"80","team":"81","productsNeeded":"82","itemsToPrepare":"83","attachments":"84","script":"85","ideaCreator":"86","photographer":"87","editor":"88","status":"89","category":"90","tags":"91","createdAt":"92"},{"item":0},"2026-06-30T23:47:58.459+07:00","June 30th 2026, 11:47:58 pm","11:47:58 pm","Tuesday","2026","June","30","23","47","58","Asia/Bangkok (UTC+07:00)",["93"],"cmr1rufqi00035auii7ehwyie","10001","Hero Serum Launch Video","video","Official",["94","95","96"],"วิดีโอเปิดตัว Hero Serum สไตล์ lifestyle herbal","Studio A","2026-06-15","10:00","12:00",["97","98"],["99"],"Backdrop สีเขียว, Props สมุนไพร",[],["100"],"Laura Power","พิมพ์ใจ ถ่ายทำ","กนก ตัดต่อ","approved","Hero Video",["101"],"2026-07-01T07:46:09.066Z",{"id":"70","contentId":"71","name":"72","mediaType":"73","channel":"74","platforms":"75","details":"76","location":"77","scheduledDate":"78","scheduledTime":"79","endTime":"80","team":"81","productsNeeded":"82","itemsToPrepare":"83","attachments":"84","script":"85","ideaCreator":"86","photographer":"87","editor":"88","status":"89","category":"90","tags":"91","createdAt":"92"},"facebook","instagram","tiktok",{"id":"102","participant":"86","responsibility":"103"},{"id":"104","participant":"105","responsibility":"106"},"Hero Serum",{"id":"107","notes":"108","action":"109","dialogue":"110","duration":"111"},"Hero Product","1","Presenter","2","วิชัย สร้างสรรค์","Camera","s1","Close-up macro","Open with product shot","สวัสดีค่ะ วันนี้มาแนะนำ Hero Serum","0:00-0:15"]	fff4720b-dc3e-4720-b007-6182d7823b5f
6	{"id":"Si28JZdUotdLzill","name":"content post","nodes":[{"parameters":{"notice":"","rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"curlImport":"","method":"GET","url":"http://app:3000/api/content/scheduled","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":false,"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"fieldToSplitOut":"items","include":"noOtherFields","options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"},{"parameters":{"curlImport":"","method":"PATCH","url":"=\\t http://app:3000/api/content/{{ $json.id }}","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":true,"contentType":"json","specifyBody":"keypair","bodyParameters":{"parameters":[{"name":"status","value":"posted"}]},"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[672,0],"id":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","name":"HTTP Request1"}],"connections":{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]},"Split Out":{"main":[[{"node":"HTTP Request1","type":"main","index":0}]]}},"settings":{"executionOrder":"v1","binaryMode":"separate","availableInMCP":false}}	[{"version":1,"startData":"1","resultData":"2","executionData":"3","resumeToken":"4"},{"destinationNode":"5","runNodeFilter":"6"},{"error":"7","runData":"8","pinData":"9","lastNodeExecuted":"10"},{"contextData":"11","nodeExecutionStack":"12","metadata":"13","waitingExecution":"14","waitingExecutionSource":"15","runtimeData":"16"},"2c21d17fd82c30e210554adf82426be03044a7a23ce1cdb25c35c9862e450f51",{"nodeName":"10","mode":"17"},["18","19","10","20"],{"level":"21","tags":"22","timestamp":1782893296072,"context":"23","functionality":"24","name":"25","node":"26","messages":"27","httpCode":"28","message":"29","stack":"30"},{"Schedule Trigger":"31","HTTP Request":"32","Split Out":"33","HTTP Request1":"34"},{},"HTTP Request1",{},["35"],{},{},{},{"version":1,"establishedAt":1782893296002,"source":"36","triggerNode":"37","redaction":"38","credentials":"39"},"inclusive","Schedule Trigger","Split Out","HTTP Request","warning",{},{"itemIndex":0,"request":"40"},"regular","NodeApiError",{"parameters":"41","type":"42","typeVersion":4.4,"position":"43","id":"44","name":"10"},["45","45"],"ECONNREFUSED","The service refused the connection - perhaps it is offline","NodeApiError: The service refused the connection - perhaps it is offline\\n    at ExecuteContext.execute (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-nodes-base@file+packages+nodes-base_@aws-sdk+credential-providers@3.808.0_asn1.js@5_8da18263ca0574b0db58d4fefd8173ce/node_modules/n8n-nodes-base/nodes/HttpRequest/V3/HttpRequestV3.node.ts:869:16)\\n    at processTicksAndRejections (node:internal/process/task_queues:104:5)\\n    at WorkflowExecute.executeNode (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1067:8)\\n    at WorkflowExecute.runNode (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1367:11)\\n    at /usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1829:27\\n    at /usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:2521:11",["46"],["47"],["48"],["49"],{"node":"50","data":"51","source":"52"},"manual",{"name":"10","type":"42"},{"version":2,"production":false,"manual":false,"source":"53"},"U2FsdGVkX19SHE1PVGzywtrc+Lk9SH+L9qw3a/aPVqgxWcT6k0YaJQcW7cB3cBCDBR+h65/NbdtbHFu3eM91TcAQp2UoH8nvkv7cZDCBDW9XBEHOcbm36qtg5cdQdlB8hWHYYhDF9QXN6OjdVfOnT2MS57NTM/vLL1G0cQy0g9KiyUu68UXz00v6ruurpxlsTNQ1dxmWN/xznEk0ceH4MVX8R+iynl7wiwFysEbm9dByfwan9Qz/3p/zTpCjNC15Cdq3aSh6/UXSYLYQ8SHDd79TScpiB3z7gvxv2Jenwhs/Afhy9n6BEpdQudAN3Jh3I+Qk3P1GXNr64BgBXWz7QqsCWhyrVKefffehrU9epEPJ6KkeTPv7OJVy7ESnhlc3ge5N4z92PByTbmQjHpCbtHxMP+0/wHlmTyYbFQcgxV328cYd0wQZng50cJRPk1wDWAaliJFS/Q9Ff8IQYApWd6gpApo02bioE0jutZUjYknGAoXZTPa3t3dCfiLY71jwdhwgbYM4OujRfIe3EIClBQ==",{"body":"54","headers":"55","method":"56","uri":"57","gzip":true,"rejectUnauthorized":true,"followRedirect":true,"resolveWithFullResponse":true,"sendCredentialsOnCrossOriginRedirect":false,"followAllRedirects":true,"timeout":300000,"encoding":null,"json":false,"useStream":true},{"curlImport":"58","method":"56","url":"59","authentication":"60","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"61","headerParameters":"62","sendBody":true,"contentType":"63","specifyBody":"61","bodyParameters":"64","options":"65","infoMessage":"58"},"n8n-nodes-base.httpRequest",[672,0],"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","connect ECONNREFUSED ::1:3001",{"startTime":1782838078458,"executionIndex":0,"source":"66","hints":"67","executionTime":1,"executionStatus":"68","data":"69"},{"startTime":1782892305418,"executionIndex":1,"source":"70","hints":"71","executionTime":51,"executionStatus":"68","data":"72"},{"startTime":1782892827672,"executionIndex":2,"source":"73","hints":"74","executionTime":2,"executionStatus":"68","data":"75"},{"startTime":1782893296008,"executionIndex":3,"source":"76","hints":"77","executionTime":77,"executionStatus":"78","error":"79"},{"parameters":"80","type":"42","typeVersion":4.4,"position":"81","id":"44","name":"10"},{"main":"82"},{"main":"76"},"workflow",{"status":"83"},{"x-api-key":"84","accept":"85"},"PATCH","http://app:3000/api/content/cmr1rufqi00035auii7ehwyie","","=\\t http://app:3000/api/content/{{ $json.id }}","none","keypair",{"parameters":"86"},"json",{"parameters":"87"},{},[],[],"success",{"main":"88"},["89"],[],{"main":"90"},["91"],[],{"main":"92"},["93"],[],"error",{"level":"21","tags":"22","timestamp":1782893296072,"context":"23","functionality":"24","name":"25","node":"26","messages":"27","httpCode":"28","message":"29","stack":"30"},{"curlImport":"58","method":"56","url":"59","authentication":"60","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"61","headerParameters":"94","sendBody":true,"contentType":"63","specifyBody":"61","bodyParameters":"95","options":"96","infoMessage":"58"},[672,0],["97"],"posted","**hidden**","application/json,text/html,application/xhtml+xml,application/xml,text/*;q=0.9, image/*;q=0.8, */*;q=0.7",["98"],["99"],["100"],{"previousNode":"18","previousNodeOutput":0,"previousNodeRun":0},["101"],{"previousNode":"20","previousNodeOutput":0,"previousNodeRun":0},["102"],{"previousNode":"19","previousNodeOutput":0,"previousNodeRun":0},{"parameters":"103"},{"parameters":"104"},{},["105"],{"name":"106","value":"107"},{"name":"108","value":"83"},["109"],["110"],["111"],["112"],["113"],{"json":"114","pairedItem":"115"},"x-api-key","dev-n8n-api-key-change-in-production","status",{"json":"116","pairedItem":"117"},{"json":"118","pairedItem":"119"},{"json":"114","pairedItem":"120"},{"name":"106","value":"107"},{"name":"108","value":"83"},{"id":"121","contentId":"122","name":"123","mediaType":"124","channel":"125","platforms":"126","details":"127","location":"128","scheduledDate":"129","scheduledTime":"130","endTime":"131","team":"132","productsNeeded":"133","itemsToPrepare":"134","attachments":"135","script":"136","ideaCreator":"137","photographer":"138","editor":"139","status":"140","category":"141","tags":"142","createdAt":"143"},{"item":0},{"timestamp":"144","Readable date":"145","Readable time":"146","Day of week":"147","Year":"148","Month":"149","Day of month":"150","Hour":"151","Minute":"152","Second":"153","Timezone":"154"},{"item":0},{"count":1,"items":"155"},{"item":0},{"item":0},"cmr1rufqi00035auii7ehwyie","10001","Hero Serum Launch Video","video","Official",["156","157","158"],"วิดีโอเปิดตัว Hero Serum สไตล์ lifestyle herbal","Studio A","2026-06-15","10:00","12:00",["159","160"],["161"],"Backdrop สีเขียว, Props สมุนไพร",[],["162"],"Laura Power","พิมพ์ใจ ถ่ายทำ","กนก ตัดต่อ","approved","Hero Video",["163"],"2026-07-01T07:46:09.066Z","2026-06-30T23:47:58.459+07:00","June 30th 2026, 11:47:58 pm","11:47:58 pm","Tuesday","2026","June","30","23","47","58","Asia/Bangkok (UTC+07:00)",["164"],"facebook","instagram","tiktok",{"id":"165","participant":"137","responsibility":"166"},{"id":"167","participant":"168","responsibility":"169"},"Hero Serum",{"id":"170","notes":"171","action":"172","dialogue":"173","duration":"174"},"Hero Product",{"id":"121","contentId":"122","name":"123","mediaType":"124","channel":"125","platforms":"175","details":"127","location":"128","scheduledDate":"129","scheduledTime":"130","endTime":"131","team":"176","productsNeeded":"177","itemsToPrepare":"134","attachments":"178","script":"179","ideaCreator":"137","photographer":"138","editor":"139","status":"140","category":"141","tags":"180","createdAt":"143"},"1","Presenter","2","วิชัย สร้างสรรค์","Camera","s1","Close-up macro","Open with product shot","สวัสดีค่ะ วันนี้มาแนะนำ Hero Serum","0:00-0:15",["156","157","158"],["181","182"],["161"],[],["183"],["163"],{"id":"165","participant":"137","responsibility":"166"},{"id":"167","participant":"168","responsibility":"169"},{"id":"170","notes":"171","action":"172","dialogue":"173","duration":"174"}]	958f9d58-aa29-4953-914f-a5f61de89b26
15	{"id":"Si28JZdUotdLzill","name":"content post","nodes":[{"parameters":{"notice":"","rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"curlImport":"","method":"GET","url":"http://app:3000/api/content/scheduled","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":false,"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"fieldToSplitOut":"items","include":"noOtherFields","options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"},{"parameters":{"curlImport":"","method":"PATCH","url":"=\\t http://app:3000/api/content/{{ $json.id }}","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":true,"contentType":"json","specifyBody":"keypair","bodyParameters":{"parameters":[{"name":"status","value":"posted"}]},"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[672,0],"id":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","name":"HTTP Request1"}],"connections":{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]},"Split Out":{"main":[[{"node":"HTTP Request1","type":"main","index":0}]]}},"settings":{"executionOrder":"v1","binaryMode":"separate","availableInMCP":false}}	[{"version":1,"startData":"1","resultData":"2","executionData":"3","resumeToken":"4"},{},{"runData":"5","lastNodeExecuted":"6"},{"contextData":"7","nodeExecutionStack":"8","metadata":"9","waitingExecution":"10","waitingExecutionSource":"11","runtimeData":"12"},"b01da6b97b757bd847400dfa99db22100041fe2a4375d1b530afef95befd3cae",{"Schedule Trigger":"13","HTTP Request":"14","Split Out":"15"},"Split Out",{},[],{},{},{},{"version":1,"establishedAt":1782897338039,"source":"16","triggerNode":"17","redaction":"18"},["19"],["20"],["21"],"trigger",{"name":"22","type":"23"},{"version":2,"production":false,"manual":false,"source":"24"},{"startTime":1782897338065,"executionIndex":0,"source":"25","hints":"26","executionTime":1,"executionStatus":"27","data":"28"},{"startTime":1782897338066,"executionIndex":1,"source":"29","hints":"30","executionTime":289,"executionStatus":"27","data":"31"},{"startTime":1782897338355,"executionIndex":2,"source":"32","hints":"33","executionTime":1,"executionStatus":"27","data":"34"},"Schedule Trigger","n8n-nodes-base.scheduleTrigger","workflow",[],[],"success",{"main":"35"},["36"],[],{"main":"37"},["38"],[],{"main":"39"},["40"],{"previousNode":"22","previousNodeOutput":0,"previousNodeRun":0},["41"],{"previousNode":"42","previousNodeOutput":0,"previousNodeRun":0},["43"],["44"],["45"],"HTTP Request",[],{"json":"46","pairedItem":"47"},{"json":"48","pairedItem":"49"},{"timestamp":"50","Readable date":"51","Readable time":"52","Day of week":"53","Year":"54","Month":"55","Day of month":"56","Hour":"57","Minute":"58","Second":"59","Timezone":"60"},{"item":0},{"count":0,"items":"61"},{"item":0},"2026-07-01T16:15:38.037+07:00","July 1st 2026, 4:15:38 pm","4:15:38 pm","Wednesday","2026","July","01","16","15","38","Asia/Bangkok (UTC+07:00)",[]]	958f9d58-aa29-4953-914f-a5f61de89b26
7	{"id":"Si28JZdUotdLzill","name":"content post","nodes":[{"parameters":{"notice":"","rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"curlImport":"","method":"GET","url":"http://app:3000/api/content/scheduled","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":false,"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"fieldToSplitOut":"items","include":"noOtherFields","options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"},{"parameters":{"curlImport":"","method":"PATCH","url":"=\\t http://app:3000/api/content/{{ $json.id }}","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":true,"contentType":"json","specifyBody":"keypair","bodyParameters":{"parameters":[{"name":"status","value":"posted"}]},"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[672,0],"id":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","name":"HTTP Request1"}],"connections":{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]},"Split Out":{"main":[[{"node":"HTTP Request1","type":"main","index":0}]]}},"settings":{"executionOrder":"v1","binaryMode":"separate","availableInMCP":false}}	[{"version":1,"startData":"1","resultData":"2","executionData":"3","resumeToken":"4"},{"destinationNode":"5","runNodeFilter":"6"},{"error":"7","runData":"8","pinData":"9","lastNodeExecuted":"10"},{"contextData":"11","nodeExecutionStack":"12","metadata":"13","waitingExecution":"14","waitingExecutionSource":"15","runtimeData":"16"},"f85bdb9e7ee4ed9c2fad8197eb8a7ea5344ffa9486c5bccc979a79ca31827660",{"nodeName":"10","mode":"17"},["18","19","10","20"],{"level":"21","tags":"22","description":"23","timestamp":1782893736026,"context":"24","functionality":"25","name":"26","node":"27","messages":"28","httpCode":"29","message":"30","stack":"31"},{"Schedule Trigger":"32","HTTP Request":"33","Split Out":"34","HTTP Request1":"35"},{},"HTTP Request1",{},["36"],{},{},{},{"version":1,"establishedAt":1782893735979,"source":"37","triggerNode":"38","redaction":"39","credentials":"40"},"inclusive","Schedule Trigger","Split Out","HTTP Request","warning",{},"<!DOCTYPE html><html><head><meta charSet=\\"utf-8\\" data-next-head=\\"\\"/><meta name=\\"viewport\\" content=\\"width=device-width\\" data-next-head=\\"\\"/><style data-next-hide-fouc=\\"true\\">body{display:none}</style><noscript data-next-hide-fouc=\\"true\\"><style>body{display:block}</style></noscript><noscript data-n-css=\\"\\"></noscript><script defer=\\"\\" noModule=\\"\\" src=\\"/_next/static/chunks/polyfills.js\\"></script><script src=\\"/_next/static/chunks/webpack.js\\" defer=\\"\\"></script><script src=\\"/_next/static/chunks/main.js\\" defer=\\"\\"></script><script src=\\"/_next/static/chunks/pages/_app.js\\" defer=\\"\\"></script><script src=\\"/_next/static/chunks/pages/_error.js\\" defer=\\"\\"></script><script src=\\"/_next/static/development/_buildManifest.js\\" defer=\\"\\"></script><script src=\\"/_next/static/development/_ssgManifest.js\\" defer=\\"\\"></script><noscript id=\\"__next_css__DO_NOT_USE__\\"></noscript></head><body><div id=\\"__next\\"></div><script src=\\"/_next/static/chunks/react-refresh.js\\"></script><script id=\\"__NEXT_DATA__\\" type=\\"application/json\\">{\\"props\\":{\\"pageProps\\":{\\"statusCode\\":500,\\"hostname\\":\\"0.0.0.0\\"}},\\"page\\":\\"/_error\\",\\"query\\":{},\\"buildId\\":\\"development\\",\\"isFallback\\":false,\\"err\\":{\\"name\\":\\"ReferenceError\\",\\"source\\":\\"edge-server\\",\\"message\\":\\"request is not defined\\",\\"stack\\":\\"ReferenceError: request is not defined\\\\n    at authorized (webpack-internal:///(middleware)/./auth.config.ts:35:35)\\\\n    at handleAuth (webpack-internal:///(middleware)/./node_modules/next-auth/lib/index.js:141:55)\\\\n    at processTicksAndRejections\\"},\\"gip\\":true,\\"scriptLoader\\":[]}</script></body></html>",{"itemIndex":0,"request":"41"},"regular","NodeApiError",{"parameters":"42","type":"43","typeVersion":4.4,"position":"44","id":"45","name":"10"},["46"],"404","The resource you are requesting could not be found","NodeApiError: The resource you are requesting could not be found\\n    at ExecuteContext.execute (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-nodes-base@file+packages+nodes-base_@aws-sdk+credential-providers@3.808.0_asn1.js@5_8da18263ca0574b0db58d4fefd8173ce/node_modules/n8n-nodes-base/nodes/HttpRequest/V3/HttpRequestV3.node.ts:869:16)\\n    at processTicksAndRejections (node:internal/process/task_queues:104:5)\\n    at WorkflowExecute.executeNode (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1067:8)\\n    at WorkflowExecute.runNode (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1367:11)\\n    at /usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1829:27\\n    at /usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:2521:11",["47"],["48"],["49"],["50"],{"node":"51","data":"52","source":"53"},"manual",{"name":"10","type":"43"},{"version":2,"production":false,"manual":false,"source":"54"},"U2FsdGVkX18ZP4acC4ZDUM5zvxekkYJ7DF7+mEmz//00J/SEjMBO7lNRUNCBfwr51zwRR8JwTMrZ1FkJj2rFxhmE4NC4xVb5m148QvLgUeEd7eEADZRxZ4VZj0o9w/BmdY+Ov+jzfEkU4k9KIRQESvF0kWiuZJsCP/85Q2HNK/5FwFmW5LMPK+xSDgAgO2gWNAaC6bGwG+GKJ4n00ivVsOkNDx+ycQWDGKs75hjqEml7UWVo7R2Fi8xXW6Vv+bl+FXcHoarem3RmnxzNbTYV99vNRrgaOOzwoaYFAS36sAvY+dVOfI+hSwa0eUzDvqgzZpuwPZ3zsm9NAXsybbPQ9pVSMTZE9+fn3MdfqCyFmP9LG3usrwYXPnXx/rmGRA6FBVDT7wSAJPgfz79s0ZRwT672T9ruVIr6AwjDJebum1m2Vb7/lWVkG/yXsrK8CENVK58I7JrApRiHAF89AzMjHAshTvCSnpPmD2HIGy/2CsW3gzqdQyPe2qMfWl+UO8frKuPAZ9fsliCRFiASffatiQ==",{"body":"55","headers":"56","method":"57","uri":"58","gzip":true,"rejectUnauthorized":true,"followRedirect":true,"resolveWithFullResponse":true,"sendCredentialsOnCrossOriginRedirect":false,"followAllRedirects":true,"timeout":300000,"encoding":null,"json":false,"useStream":true},{"curlImport":"59","method":"57","url":"60","authentication":"61","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"62","headerParameters":"63","sendBody":true,"contentType":"64","specifyBody":"62","bodyParameters":"65","options":"66","infoMessage":"59"},"n8n-nodes-base.httpRequest",[672,0],"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","404 - \\"<!DOCTYPE html><html><head><meta charSet=\\\\\\"utf-8\\\\\\" data-next-head=\\\\\\"\\\\\\"/><meta name=\\\\\\"viewport\\\\\\" content=\\\\\\"width=device-width\\\\\\" data-next-head=\\\\\\"\\\\\\"/><style data-next-hide-fouc=\\\\\\"true\\\\\\">body{display:none}</style><noscript data-next-hide-fouc=\\\\\\"true\\\\\\"><style>body{display:block}</style></noscript><noscript data-n-css=\\\\\\"\\\\\\"></noscript><script defer=\\\\\\"\\\\\\" noModule=\\\\\\"\\\\\\" src=\\\\\\"/_next/static/chunks/polyfills.js\\\\\\"></script><script src=\\\\\\"/_next/static/chunks/webpack.js\\\\\\" defer=\\\\\\"\\\\\\"></script><script src=\\\\\\"/_next/static/chunks/main.js\\\\\\" defer=\\\\\\"\\\\\\"></script><script src=\\\\\\"/_next/static/chunks/pages/_app.js\\\\\\" defer=\\\\\\"\\\\\\"></script><script src=\\\\\\"/_next/static/chunks/pages/_error.js\\\\\\" defer=\\\\\\"\\\\\\"></script><script src=\\\\\\"/_next/static/development/_buildManifest.js\\\\\\" defer=\\\\\\"\\\\\\"></script><script src=\\\\\\"/_next/static/development/_ssgManifest.js\\\\\\" defer=\\\\\\"\\\\\\"></script><noscript id=\\\\\\"__next_css__DO_NOT_USE__\\\\\\"></noscript></head><body><div id=\\\\\\"__next\\\\\\"></div><script src=\\\\\\"/_next/static/chunks/react-refresh.js\\\\\\"></script><script id=\\\\\\"__NEXT_DATA__\\\\\\" type=\\\\\\"application/json\\\\\\">{\\\\\\"props\\\\\\":{\\\\\\"pageProps\\\\\\":{\\\\\\"statusCode\\\\\\":500,\\\\\\"hostname\\\\\\":\\\\\\"0.0.0.0\\\\\\"}},\\\\\\"page\\\\\\":\\\\\\"/_error\\\\\\",\\\\\\"query\\\\\\":{},\\\\\\"buildId\\\\\\":\\\\\\"development\\\\\\",\\\\\\"isFallback\\\\\\":false,\\\\\\"err\\\\\\":{\\\\\\"name\\\\\\":\\\\\\"ReferenceError\\\\\\",\\\\\\"source\\\\\\":\\\\\\"edge-server\\\\\\",\\\\\\"message\\\\\\":\\\\\\"request is not defined\\\\\\",\\\\\\"stack\\\\\\":\\\\\\"ReferenceError: request is not defined\\\\\\\\n    at authorized (webpack-internal:///(middleware)/./auth.config.ts:35:35)\\\\\\\\n    at handleAuth (webpack-internal:///(middleware)/./node_modules/next-auth/lib/index.js:141:55)\\\\\\\\n    at processTicksAndRejections\\\\\\"},\\\\\\"gip\\\\\\":true,\\\\\\"scriptLoader\\\\\\":[]}</script></body></html>\\"",{"startTime":1782838078458,"executionIndex":0,"source":"67","hints":"68","executionTime":1,"executionStatus":"69","data":"70"},{"startTime":1782892305418,"executionIndex":1,"source":"71","hints":"72","executionTime":51,"executionStatus":"69","data":"73"},{"startTime":1782892827672,"executionIndex":2,"source":"74","hints":"75","executionTime":2,"executionStatus":"69","data":"76"},{"startTime":1782893735985,"executionIndex":3,"source":"77","hints":"78","executionTime":43,"executionStatus":"79","error":"80"},{"parameters":"81","type":"43","typeVersion":4.4,"position":"82","id":"45","name":"10"},{"main":"83"},{"main":"77"},"workflow",{"status":"84"},{"x-api-key":"85","accept":"86"},"PATCH","http://app:3000/api/content/cmr1rufqi00035auii7ehwyie","","=\\t http://app:3000/api/content/{{ $json.id }}","none","keypair",{"parameters":"87"},"json",{"parameters":"88"},{},[],[],"success",{"main":"89"},["90"],[],{"main":"91"},["92"],[],{"main":"93"},["94"],[],"error",{"level":"21","tags":"22","description":"23","timestamp":1782893736026,"context":"24","functionality":"25","name":"26","node":"27","messages":"28","httpCode":"29","message":"30","stack":"31"},{"curlImport":"59","method":"57","url":"60","authentication":"61","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"62","headerParameters":"95","sendBody":true,"contentType":"64","specifyBody":"62","bodyParameters":"96","options":"97","infoMessage":"59"},[672,0],["98"],"posted","**hidden**","application/json,text/html,application/xhtml+xml,application/xml,text/*;q=0.9, image/*;q=0.8, */*;q=0.7",["99"],["100"],["101"],{"previousNode":"18","previousNodeOutput":0,"previousNodeRun":0},["102"],{"previousNode":"20","previousNodeOutput":0,"previousNodeRun":0},["103"],{"previousNode":"19","previousNodeOutput":0,"previousNodeRun":0},{"parameters":"104"},{"parameters":"105"},{},["106"],{"name":"107","value":"108"},{"name":"109","value":"84"},["110"],["111"],["112"],["113"],["114"],{"json":"115","pairedItem":"116"},"x-api-key","dev-n8n-api-key-change-in-production","status",{"json":"117","pairedItem":"118"},{"json":"119","pairedItem":"120"},{"json":"115","pairedItem":"121"},{"name":"107","value":"108"},{"name":"109","value":"84"},{"id":"122","contentId":"123","name":"124","mediaType":"125","channel":"126","platforms":"127","details":"128","location":"129","scheduledDate":"130","scheduledTime":"131","endTime":"132","team":"133","productsNeeded":"134","itemsToPrepare":"135","attachments":"136","script":"137","ideaCreator":"138","photographer":"139","editor":"140","status":"141","category":"142","tags":"143","createdAt":"144"},{"item":0},{"timestamp":"145","Readable date":"146","Readable time":"147","Day of week":"148","Year":"149","Month":"150","Day of month":"151","Hour":"152","Minute":"153","Second":"154","Timezone":"155"},{"item":0},{"count":1,"items":"156"},{"item":0},{"item":0},"cmr1rufqi00035auii7ehwyie","10001","Hero Serum Launch Video","video","Official",["157","158","159"],"วิดีโอเปิดตัว Hero Serum สไตล์ lifestyle herbal","Studio A","2026-06-15","10:00","12:00",["160","161"],["162"],"Backdrop สีเขียว, Props สมุนไพร",[],["163"],"Laura Power","พิมพ์ใจ ถ่ายทำ","กนก ตัดต่อ","approved","Hero Video",["164"],"2026-07-01T07:46:09.066Z","2026-06-30T23:47:58.459+07:00","June 30th 2026, 11:47:58 pm","11:47:58 pm","Tuesday","2026","June","30","23","47","58","Asia/Bangkok (UTC+07:00)",["165"],"facebook","instagram","tiktok",{"id":"166","participant":"138","responsibility":"167"},{"id":"168","participant":"169","responsibility":"170"},"Hero Serum",{"id":"171","notes":"172","action":"173","dialogue":"174","duration":"175"},"Hero Product",{"id":"122","contentId":"123","name":"124","mediaType":"125","channel":"126","platforms":"176","details":"128","location":"129","scheduledDate":"130","scheduledTime":"131","endTime":"132","team":"177","productsNeeded":"178","itemsToPrepare":"135","attachments":"179","script":"180","ideaCreator":"138","photographer":"139","editor":"140","status":"141","category":"142","tags":"181","createdAt":"144"},"1","Presenter","2","วิชัย สร้างสรรค์","Camera","s1","Close-up macro","Open with product shot","สวัสดีค่ะ วันนี้มาแนะนำ Hero Serum","0:00-0:15",["157","158","159"],["182","183"],["162"],[],["184"],["164"],{"id":"166","participant":"138","responsibility":"167"},{"id":"168","participant":"169","responsibility":"170"},{"id":"171","notes":"172","action":"173","dialogue":"174","duration":"175"}]	958f9d58-aa29-4953-914f-a5f61de89b26
8	{"id":"Si28JZdUotdLzill","name":"content post","nodes":[{"parameters":{"notice":"","rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"curlImport":"","method":"GET","url":"http://app:3000/api/content/scheduled","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":false,"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"fieldToSplitOut":"items","include":"noOtherFields","options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"},{"parameters":{"curlImport":"","method":"PATCH","url":"=\\t http://app:3000/api/content/{{ $json.id }}","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":true,"contentType":"json","specifyBody":"keypair","bodyParameters":{"parameters":[{"name":"status","value":"posted"}]},"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[672,0],"id":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","name":"HTTP Request1"}],"connections":{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]},"Split Out":{"main":[[{"node":"HTTP Request1","type":"main","index":0}]]}},"settings":{"executionOrder":"v1","binaryMode":"separate","availableInMCP":false}}	[{"version":1,"startData":"1","resultData":"2","executionData":"3","resumeToken":"4"},{"destinationNode":"5","runNodeFilter":"6"},{"error":"7","runData":"8","pinData":"9","lastNodeExecuted":"10"},{"contextData":"11","nodeExecutionStack":"12","metadata":"13","waitingExecution":"14","waitingExecutionSource":"15","runtimeData":"16"},"1bed89a27ca98e92fd391513bc215e9032cd4d104a47c1da58074a5f06e5bf6f",{"nodeName":"17","mode":"18"},["19","10","20","17"],{"level":"21","tags":"22","description":"23","timestamp":1782893754201,"context":"24","functionality":"25","name":"26","node":"27","messages":"28","httpCode":"29","message":"30","stack":"31"},{"Schedule Trigger":"32","HTTP Request":"33"},{},"HTTP Request",{},["34"],{},{},{},{"version":1,"establishedAt":1782893752741,"source":"35","triggerNode":"36","redaction":"37","credentials":"38"},"HTTP Request1","inclusive","Schedule Trigger","Split Out","warning",{},"<!DOCTYPE html><html><head><meta charSet=\\"utf-8\\" data-next-head=\\"\\"/><meta name=\\"viewport\\" content=\\"width=device-width\\" data-next-head=\\"\\"/><style data-next-hide-fouc=\\"true\\">body{display:none}</style><noscript data-next-hide-fouc=\\"true\\"><style>body{display:block}</style></noscript><noscript data-n-css=\\"\\"></noscript><script defer=\\"\\" noModule=\\"\\" src=\\"/_next/static/chunks/polyfills.js\\"></script><script src=\\"/_next/static/chunks/webpack.js\\" defer=\\"\\"></script><script src=\\"/_next/static/chunks/main.js\\" defer=\\"\\"></script><script src=\\"/_next/static/chunks/pages/_app.js\\" defer=\\"\\"></script><script src=\\"/_next/static/chunks/pages/_error.js\\" defer=\\"\\"></script><script src=\\"/_next/static/development/_buildManifest.js\\" defer=\\"\\"></script><script src=\\"/_next/static/development/_ssgManifest.js\\" defer=\\"\\"></script><noscript id=\\"__next_css__DO_NOT_USE__\\"></noscript></head><body><div id=\\"__next\\"></div><script src=\\"/_next/static/chunks/react-refresh.js\\"></script><script id=\\"__NEXT_DATA__\\" type=\\"application/json\\">{\\"props\\":{\\"pageProps\\":{\\"statusCode\\":500,\\"hostname\\":\\"0.0.0.0\\"}},\\"page\\":\\"/_error\\",\\"query\\":{},\\"buildId\\":\\"development\\",\\"isFallback\\":false,\\"err\\":{\\"name\\":\\"ReferenceError\\",\\"source\\":\\"edge-server\\",\\"message\\":\\"request is not defined\\",\\"stack\\":\\"ReferenceError: request is not defined\\\\n    at authorized (webpack-internal:///(middleware)/./auth.config.ts:35:35)\\\\n    at handleAuth (webpack-internal:///(middleware)/./node_modules/next-auth/lib/index.js:141:55)\\\\n    at processTicksAndRejections\\"},\\"gip\\":true,\\"scriptLoader\\":[]}</script></body></html>",{"itemIndex":0,"request":"39"},"regular","NodeApiError",{"parameters":"40","type":"41","typeVersion":4.4,"position":"42","id":"43","name":"10"},["44"],"404","The resource you are requesting could not be found","NodeApiError: The resource you are requesting could not be found\\n    at ExecuteContext.execute (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-nodes-base@file+packages+nodes-base_@aws-sdk+credential-providers@3.808.0_asn1.js@5_8da18263ca0574b0db58d4fefd8173ce/node_modules/n8n-nodes-base/nodes/HttpRequest/V3/HttpRequestV3.node.ts:869:16)\\n    at processTicksAndRejections (node:internal/process/task_queues:104:5)\\n    at WorkflowExecute.executeNode (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1067:8)\\n    at WorkflowExecute.runNode (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1367:11)\\n    at /usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1829:27\\n    at /usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:2521:11",["45"],["46"],{"node":"47","data":"48","source":"49"},"manual",{"name":"19","type":"50"},{"version":2,"production":false,"manual":false,"source":"51"},"U2FsdGVkX19nQGX/5LIfQNk59iWYS5d/AhBazPDGu700kzDB/o1c9cW7cGm2MA5Dt15rdn4jj+LSlhHwU9I4ActQRL5w5tnNd5c/fQ8sogGa+548aWlYu0z8Lq/c7Xn4RomVdui/yYAMtsBeZaPKaFlL/qe+EO7p3z62wdL2tWW/6F8HX9KROV2CBMvU1N8C3lv/k6FNJwts1Noi7mt8NECFGpxCYC3fnDIzQQ+QX49oCX7o4lBcqQlz6eDf00GAH5Vg9yZaa/eTMnX9ccWQHwV2J+NJGBvCrDiyqqt4XVN8w/35tqjEJQl9uIHy+zSOqkbzt/C9rTRDFMa5qEvP36foicSVoxKYbcIEKZMx7AiU6PCVB5H0qihS6hApOxyzOH7+1LcagmVz0Z1lVSw7g2T+B+SgNDmhAZNoDQdtl3ZkRmezdaqa1247NAcYC3+43vcQHiLq+jrS9BxQM20a4vJXg8k/y41rBfpIUVDNJPrht00vcN5n4mVKSJWMPZVHPnSY8rLqFT/Y+FbD6OuSxw==",{"headers":"52","method":"53","uri":"54","gzip":true,"rejectUnauthorized":true,"followRedirect":true,"resolveWithFullResponse":true,"sendCredentialsOnCrossOriginRedirect":false,"followAllRedirects":true,"timeout":300000,"encoding":null,"json":false,"useStream":true},{"curlImport":"55","method":"53","url":"54","authentication":"56","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"57","headerParameters":"58","sendBody":false,"options":"59","infoMessage":"55"},"n8n-nodes-base.httpRequest",[256,0],"c38b27ff-6b94-479f-be61-d469406da108","404 - \\"<!DOCTYPE html><html><head><meta charSet=\\\\\\"utf-8\\\\\\" data-next-head=\\\\\\"\\\\\\"/><meta name=\\\\\\"viewport\\\\\\" content=\\\\\\"width=device-width\\\\\\" data-next-head=\\\\\\"\\\\\\"/><style data-next-hide-fouc=\\\\\\"true\\\\\\">body{display:none}</style><noscript data-next-hide-fouc=\\\\\\"true\\\\\\"><style>body{display:block}</style></noscript><noscript data-n-css=\\\\\\"\\\\\\"></noscript><script defer=\\\\\\"\\\\\\" noModule=\\\\\\"\\\\\\" src=\\\\\\"/_next/static/chunks/polyfills.js\\\\\\"></script><script src=\\\\\\"/_next/static/chunks/webpack.js\\\\\\" defer=\\\\\\"\\\\\\"></script><script src=\\\\\\"/_next/static/chunks/main.js\\\\\\" defer=\\\\\\"\\\\\\"></script><script src=\\\\\\"/_next/static/chunks/pages/_app.js\\\\\\" defer=\\\\\\"\\\\\\"></script><script src=\\\\\\"/_next/static/chunks/pages/_error.js\\\\\\" defer=\\\\\\"\\\\\\"></script><script src=\\\\\\"/_next/static/development/_buildManifest.js\\\\\\" defer=\\\\\\"\\\\\\"></script><script src=\\\\\\"/_next/static/development/_ssgManifest.js\\\\\\" defer=\\\\\\"\\\\\\"></script><noscript id=\\\\\\"__next_css__DO_NOT_USE__\\\\\\"></noscript></head><body><div id=\\\\\\"__next\\\\\\"></div><script src=\\\\\\"/_next/static/chunks/react-refresh.js\\\\\\"></script><script id=\\\\\\"__NEXT_DATA__\\\\\\" type=\\\\\\"application/json\\\\\\">{\\\\\\"props\\\\\\":{\\\\\\"pageProps\\\\\\":{\\\\\\"statusCode\\\\\\":500,\\\\\\"hostname\\\\\\":\\\\\\"0.0.0.0\\\\\\"}},\\\\\\"page\\\\\\":\\\\\\"/_error\\\\\\",\\\\\\"query\\\\\\":{},\\\\\\"buildId\\\\\\":\\\\\\"development\\\\\\",\\\\\\"isFallback\\\\\\":false,\\\\\\"err\\\\\\":{\\\\\\"name\\\\\\":\\\\\\"ReferenceError\\\\\\",\\\\\\"source\\\\\\":\\\\\\"edge-server\\\\\\",\\\\\\"message\\\\\\":\\\\\\"request is not defined\\\\\\",\\\\\\"stack\\\\\\":\\\\\\"ReferenceError: request is not defined\\\\\\\\n    at authorized (webpack-internal:///(middleware)/./auth.config.ts:35:35)\\\\\\\\n    at handleAuth (webpack-internal:///(middleware)/./node_modules/next-auth/lib/index.js:141:55)\\\\\\\\n    at processTicksAndRejections\\\\\\"},\\\\\\"gip\\\\\\":true,\\\\\\"scriptLoader\\\\\\":[]}</script></body></html>\\"",{"startTime":1782893752744,"executionIndex":0,"source":"60","hints":"61","executionTime":3,"executionStatus":"62","data":"63"},{"startTime":1782893752747,"executionIndex":1,"source":"64","hints":"65","executionTime":1454,"executionStatus":"66","error":"67"},{"parameters":"68","type":"41","typeVersion":4.4,"position":"69","id":"43","name":"10"},{"main":"70"},{"main":"64"},"n8n-nodes-base.scheduleTrigger","workflow",{"x-api-key":"71","accept":"72"},"GET","http://app:3000/api/content/scheduled","","none","keypair",{"parameters":"73"},{},[],[],"success",{"main":"74"},["75"],[],"error",{"level":"21","tags":"22","description":"23","timestamp":1782893754201,"context":"24","functionality":"25","name":"26","node":"27","messages":"28","httpCode":"29","message":"30","stack":"31"},{"curlImport":"55","method":"53","url":"54","authentication":"56","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"57","headerParameters":"76","sendBody":false,"options":"77","infoMessage":"55"},[256,0],["78"],"**hidden**","application/json,text/html,application/xhtml+xml,application/xml,text/*;q=0.9, image/*;q=0.8, */*;q=0.7",["79"],["80"],{"previousNode":"19","previousNodeOutput":0,"previousNodeRun":0},{"parameters":"81"},{},["82"],{"name":"83","value":"84"},["85"],["86"],{"json":"87","pairedItem":"88"},"x-api-key","dev-n8n-api-key-change-in-production",{"json":"87","pairedItem":"89"},{"name":"83","value":"84"},{"timestamp":"90","Readable date":"91","Readable time":"92","Day of week":"93","Year":"94","Month":"95","Day of month":"96","Hour":"97","Minute":"97","Second":"98","Timezone":"99"},{"item":0},{"item":0},"2026-07-01T15:15:52.746+07:00","July 1st 2026, 3:15:52 pm","3:15:52 pm","Wednesday","2026","July","01","15","52","Asia/Bangkok (UTC+07:00)"]	958f9d58-aa29-4953-914f-a5f61de89b26
9	{"id":"Si28JZdUotdLzill","name":"content post","nodes":[{"parameters":{"notice":"","rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"curlImport":"","method":"GET","url":"http://app:3000/api/content/scheduled","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":false,"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"fieldToSplitOut":"items","include":"noOtherFields","options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"},{"parameters":{"curlImport":"","method":"PATCH","url":"=\\t http://app:3000/api/content/{{ $json.id }}","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":true,"contentType":"json","specifyBody":"keypair","bodyParameters":{"parameters":[{"name":"status","value":"posted"}]},"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[672,0],"id":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","name":"HTTP Request1"}],"connections":{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]},"Split Out":{"main":[[{"node":"HTTP Request1","type":"main","index":0}]]}},"settings":{"executionOrder":"v1","binaryMode":"separate","availableInMCP":false}}	[{"version":1,"startData":"1","resultData":"2","executionData":"3","resumeToken":"4"},{"destinationNode":"5","runNodeFilter":"6"},{"error":"7","runData":"8","pinData":"9","lastNodeExecuted":"10"},{"contextData":"11","nodeExecutionStack":"12","metadata":"13","waitingExecution":"14","waitingExecutionSource":"15","runtimeData":"16"},"3e025a7965a85d75c442dc8bcadbf2c5bef2c79f5001e595f668fe4945c788d2",{"nodeName":"17","mode":"18"},["19","20","17","10"],{"level":"21","tags":"22","description":"23","timestamp":1782893766348,"context":"24","functionality":"25","name":"26","node":"27","messages":"28","httpCode":"29","message":"30","stack":"31"},{"Schedule Trigger":"32","HTTP Request":"33"},{},"HTTP Request",{},["34"],{},{},{},{"version":1,"establishedAt":1782893766295,"source":"35","triggerNode":"36","redaction":"37","credentials":"38"},"HTTP Request1","inclusive","Schedule Trigger","Split Out","warning",{},"<!DOCTYPE html><html><head><meta charSet=\\"utf-8\\" data-next-head=\\"\\"/><meta name=\\"viewport\\" content=\\"width=device-width\\" data-next-head=\\"\\"/><style data-next-hide-fouc=\\"true\\">body{display:none}</style><noscript data-next-hide-fouc=\\"true\\"><style>body{display:block}</style></noscript><noscript data-n-css=\\"\\"></noscript><script defer=\\"\\" noModule=\\"\\" src=\\"/_next/static/chunks/polyfills.js\\"></script><script src=\\"/_next/static/chunks/webpack.js\\" defer=\\"\\"></script><script src=\\"/_next/static/chunks/main.js\\" defer=\\"\\"></script><script src=\\"/_next/static/chunks/pages/_app.js\\" defer=\\"\\"></script><script src=\\"/_next/static/chunks/pages/_error.js\\" defer=\\"\\"></script><script src=\\"/_next/static/development/_buildManifest.js\\" defer=\\"\\"></script><script src=\\"/_next/static/development/_ssgManifest.js\\" defer=\\"\\"></script><noscript id=\\"__next_css__DO_NOT_USE__\\"></noscript></head><body><div id=\\"__next\\"></div><script src=\\"/_next/static/chunks/react-refresh.js\\"></script><script id=\\"__NEXT_DATA__\\" type=\\"application/json\\">{\\"props\\":{\\"pageProps\\":{\\"statusCode\\":500,\\"hostname\\":\\"0.0.0.0\\"}},\\"page\\":\\"/_error\\",\\"query\\":{},\\"buildId\\":\\"development\\",\\"isFallback\\":false,\\"err\\":{\\"name\\":\\"ReferenceError\\",\\"source\\":\\"edge-server\\",\\"message\\":\\"request is not defined\\",\\"stack\\":\\"ReferenceError: request is not defined\\\\n    at authorized (webpack-internal:///(middleware)/./auth.config.ts:35:35)\\\\n    at handleAuth (webpack-internal:///(middleware)/./node_modules/next-auth/lib/index.js:141:55)\\\\n    at processTicksAndRejections\\"},\\"gip\\":true,\\"scriptLoader\\":[]}</script></body></html>",{"itemIndex":0,"request":"39"},"regular","NodeApiError",{"parameters":"40","type":"41","typeVersion":4.4,"position":"42","id":"43","name":"10"},["44"],"404","The resource you are requesting could not be found","NodeApiError: The resource you are requesting could not be found\\n    at ExecuteContext.execute (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-nodes-base@file+packages+nodes-base_@aws-sdk+credential-providers@3.808.0_asn1.js@5_8da18263ca0574b0db58d4fefd8173ce/node_modules/n8n-nodes-base/nodes/HttpRequest/V3/HttpRequestV3.node.ts:869:16)\\n    at processTicksAndRejections (node:internal/process/task_queues:104:5)\\n    at WorkflowExecute.executeNode (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1067:8)\\n    at WorkflowExecute.runNode (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1367:11)\\n    at /usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1829:27\\n    at /usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:2521:11",["45"],["46"],{"node":"47","data":"48","source":"49"},"manual",{"name":"10","type":"41"},{"version":2,"production":false,"manual":false,"source":"50"},"U2FsdGVkX19mXuuXI9VuIvLfF28ZEfGsesU/oTNOeMK7Yx0rzI849HNAQoGsvXYiOdCZZJ8ThNvIFkFuPJ9H01GfrASwX6RhdsO+SeSiY6X9GvpLmUS0/GTVeQkwQS1GGrhY1PaxuEcrjlYgbEMMuRZRa/Iz3UqmXpqZ+PFMsfsh7xFG+PeVNUcv/NztTa/uaKygCp6L8P1Aiv+myT4MvBpMEQEVzNDQ5YiHcVJN2BCCazllgFEkyxevvHnZXLbZeFJ8+pIoVq10Noq0g4Sth7mWMZXbo8ULv0zSgfTOpLnoroZIQWIs8cEPGUjtm7Z73UjJfsS0HFXIx9HyH+39JPV6FEljygouAAHKj6snx4yB6L7VRYZuUxNA7wHG+UcHxEmii9RDv39buIrGTcOIEQuJ8qTrGQWNDu6m8iPJTmm0xveGpI3/HwvD71LVFVpvYeho0G0ZhmImiT4Yvl41ksDuN0JNJuOsFjcweUQzVFfvEI0/LU5g4ztJlQphVEkDenYR89AaNsjPt5yehaEEtg==",{"headers":"51","method":"52","uri":"53","gzip":true,"rejectUnauthorized":true,"followRedirect":true,"resolveWithFullResponse":true,"sendCredentialsOnCrossOriginRedirect":false,"followAllRedirects":true,"timeout":300000,"encoding":null,"json":false,"useStream":true},{"curlImport":"54","method":"52","url":"53","authentication":"55","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"56","headerParameters":"57","sendBody":false,"options":"58","infoMessage":"54"},"n8n-nodes-base.httpRequest",[256,0],"c38b27ff-6b94-479f-be61-d469406da108","404 - \\"<!DOCTYPE html><html><head><meta charSet=\\\\\\"utf-8\\\\\\" data-next-head=\\\\\\"\\\\\\"/><meta name=\\\\\\"viewport\\\\\\" content=\\\\\\"width=device-width\\\\\\" data-next-head=\\\\\\"\\\\\\"/><style data-next-hide-fouc=\\\\\\"true\\\\\\">body{display:none}</style><noscript data-next-hide-fouc=\\\\\\"true\\\\\\"><style>body{display:block}</style></noscript><noscript data-n-css=\\\\\\"\\\\\\"></noscript><script defer=\\\\\\"\\\\\\" noModule=\\\\\\"\\\\\\" src=\\\\\\"/_next/static/chunks/polyfills.js\\\\\\"></script><script src=\\\\\\"/_next/static/chunks/webpack.js\\\\\\" defer=\\\\\\"\\\\\\"></script><script src=\\\\\\"/_next/static/chunks/main.js\\\\\\" defer=\\\\\\"\\\\\\"></script><script src=\\\\\\"/_next/static/chunks/pages/_app.js\\\\\\" defer=\\\\\\"\\\\\\"></script><script src=\\\\\\"/_next/static/chunks/pages/_error.js\\\\\\" defer=\\\\\\"\\\\\\"></script><script src=\\\\\\"/_next/static/development/_buildManifest.js\\\\\\" defer=\\\\\\"\\\\\\"></script><script src=\\\\\\"/_next/static/development/_ssgManifest.js\\\\\\" defer=\\\\\\"\\\\\\"></script><noscript id=\\\\\\"__next_css__DO_NOT_USE__\\\\\\"></noscript></head><body><div id=\\\\\\"__next\\\\\\"></div><script src=\\\\\\"/_next/static/chunks/react-refresh.js\\\\\\"></script><script id=\\\\\\"__NEXT_DATA__\\\\\\" type=\\\\\\"application/json\\\\\\">{\\\\\\"props\\\\\\":{\\\\\\"pageProps\\\\\\":{\\\\\\"statusCode\\\\\\":500,\\\\\\"hostname\\\\\\":\\\\\\"0.0.0.0\\\\\\"}},\\\\\\"page\\\\\\":\\\\\\"/_error\\\\\\",\\\\\\"query\\\\\\":{},\\\\\\"buildId\\\\\\":\\\\\\"development\\\\\\",\\\\\\"isFallback\\\\\\":false,\\\\\\"err\\\\\\":{\\\\\\"name\\\\\\":\\\\\\"ReferenceError\\\\\\",\\\\\\"source\\\\\\":\\\\\\"edge-server\\\\\\",\\\\\\"message\\\\\\":\\\\\\"request is not defined\\\\\\",\\\\\\"stack\\\\\\":\\\\\\"ReferenceError: request is not defined\\\\\\\\n    at authorized (webpack-internal:///(middleware)/./auth.config.ts:35:35)\\\\\\\\n    at handleAuth (webpack-internal:///(middleware)/./node_modules/next-auth/lib/index.js:141:55)\\\\\\\\n    at processTicksAndRejections\\\\\\"},\\\\\\"gip\\\\\\":true,\\\\\\"scriptLoader\\\\\\":[]}</script></body></html>\\"",{"startTime":1782893752744,"executionIndex":0,"source":"59","hints":"60","executionTime":3,"executionStatus":"61","data":"62"},{"startTime":1782893766302,"executionIndex":1,"source":"63","hints":"64","executionTime":48,"executionStatus":"65","error":"66"},{"parameters":"67","type":"41","typeVersion":4.4,"position":"68","id":"43","name":"10"},{"main":"69"},{"main":"63"},"workflow",{"x-api-key":"70","accept":"71"},"GET","http://app:3000/api/content/scheduled","","none","keypair",{"parameters":"72"},{},[],[],"success",{"main":"73"},["74"],[],"error",{"level":"21","tags":"22","description":"23","timestamp":1782893766348,"context":"24","functionality":"25","name":"26","node":"27","messages":"28","httpCode":"29","message":"30","stack":"31"},{"curlImport":"54","method":"52","url":"53","authentication":"55","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"56","headerParameters":"75","sendBody":false,"options":"76","infoMessage":"54"},[256,0],["77"],"**hidden**","application/json,text/html,application/xhtml+xml,application/xml,text/*;q=0.9, image/*;q=0.8, */*;q=0.7",["78"],["79"],{"previousNode":"19","previousNodeOutput":0,"previousNodeRun":0},{"parameters":"80"},{},["81"],{"name":"82","value":"83"},["84"],["85"],{"json":"86","pairedItem":"87"},"x-api-key","dev-n8n-api-key-change-in-production",{"json":"86","pairedItem":"88"},{"name":"82","value":"83"},{"timestamp":"89","Readable date":"90","Readable time":"91","Day of week":"92","Year":"93","Month":"94","Day of month":"95","Hour":"96","Minute":"96","Second":"97","Timezone":"98"},{"item":0},{"item":0},"2026-07-01T15:15:52.746+07:00","July 1st 2026, 3:15:52 pm","3:15:52 pm","Wednesday","2026","July","01","15","52","Asia/Bangkok (UTC+07:00)"]	958f9d58-aa29-4953-914f-a5f61de89b26
10	{"id":"Si28JZdUotdLzill","name":"content post","nodes":[{"parameters":{"notice":"","rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"curlImport":"","method":"GET","url":"http://app:3000/api/content/scheduled","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":false,"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"fieldToSplitOut":"items","include":"noOtherFields","options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"},{"parameters":{"curlImport":"","method":"PATCH","url":"=\\t http://app:3000/api/content/{{ $json.id }}","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":true,"contentType":"json","specifyBody":"keypair","bodyParameters":{"parameters":[{"name":"status","value":"posted"}]},"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[672,0],"id":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","name":"HTTP Request1"}],"connections":{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]},"Split Out":{"main":[[{"node":"HTTP Request1","type":"main","index":0}]]}},"settings":{"executionOrder":"v1","binaryMode":"separate","availableInMCP":false}}	[{"version":1,"startData":"1","resultData":"2","executionData":"3","resumeToken":"4"},{"destinationNode":"5","runNodeFilter":"6"},{"runData":"7","pinData":"8","lastNodeExecuted":"9"},{"contextData":"10","nodeExecutionStack":"11","metadata":"12","waitingExecution":"13","waitingExecutionSource":"14","runtimeData":"15"},"3c961fdf79ac42d786a4fa8b66ffefdc1d2c6a6757a963cf7404a0163d60897d",{"nodeName":"9","mode":"16"},["17","9"],{"Schedule Trigger":"18","HTTP Request":"19"},{},"HTTP Request",{"node:HTTP Request":"20"},[],{},{},{},{"version":1,"establishedAt":1782893899496,"source":"21","triggerNode":"22","redaction":"23","credentials":"24"},"inclusive","Schedule Trigger",["25"],["26"],{"response":"27"},"manual",{"name":"9","type":"28"},{"version":2,"production":false,"manual":false,"source":"29"},"U2FsdGVkX1+YvvB9rdYQqwH7xdNRTSItbMHutuyYfPvNu6fxX95iRvO61HsnJhqwwkBwG2USAoQx/XT1XR5NtDJdjI/2QZdSfXdettC/5HMigdEl3PFdhEAuC1caRyCUJOGJm81Zm1rXmZ/vV7qU6nJjdlvXtfNRZWhNRce+CM8dI0TO2vxzJUx9mcILEn/jqV3saeXKrtPfveU483sT2yxb7PCgydt/8EJd0YrQMwvqtMTf+pnT08LDlspYIHAk+VhXAoWe7W0W8sSc2lkqQtrXUSOaUpJZB/jupZ9bZJaoAXy3IxxXzqD1MJEUrMALXENashQKYbqnzlMpCk90ylG8Z7uBStdLvjnJrPyAMvmIpqRhOn5pXHO/yyJL6IcLgSOu1r6Obz06GtX54uNTvvkGHEMT5nwhfyNEENj73NxmV6/49U4Wg9q6rIHmSRsr41TWTdHelMLqhjaAmJ3UcIjqsp2W7CU4CC8ItKJupW/klrPNG3bFRAXUef/NzCja9brp+SZP2Zec8p7U0EawNA==",{"startTime":1782893752744,"executionIndex":0,"source":"30","hints":"31","executionTime":3,"executionStatus":"32","data":"33"},{"startTime":1782893899502,"executionIndex":1,"source":"34","hints":"35","executionTime":24,"executionStatus":"32","data":"36"},{"body":"37"},"n8n-nodes-base.httpRequest","workflow",[],[],"success",{"main":"38"},["39"],[],{"main":"40"},{"count":1,"items":"41"},["42"],{"previousNode":"17","previousNodeOutput":0,"previousNodeRun":0},["43"],["44"],["45"],["46"],{"id":"47","contentId":"48","name":"49","mediaType":"50","channel":"51","platforms":"52","details":"53","location":"54","scheduledDate":"55","scheduledTime":"56","endTime":"57","team":"58","productsNeeded":"59","itemsToPrepare":"60","attachments":"61","script":"62","ideaCreator":"63","photographer":"64","editor":"65","status":"66","category":"67","tags":"68","createdAt":"69"},{"json":"70","pairedItem":"71"},{"json":"37","pairedItem":"72"},"cmr1rufqi00035auii7ehwyie","10001","Hero Serum Launch Video","video","Official",["73","74","75"],"วิดีโอเปิดตัว Hero Serum สไตล์ lifestyle herbal","Studio A","2026-06-15","10:00","12:00",["76","77"],["78"],"Backdrop สีเขียว, Props สมุนไพร",[],["79"],"Laura Power","พิมพ์ใจ ถ่ายทำ","กนก ตัดต่อ","approved","Hero Video",["80"],"2026-07-01T07:46:09.066Z",{"timestamp":"81","Readable date":"82","Readable time":"83","Day of week":"84","Year":"85","Month":"86","Day of month":"87","Hour":"88","Minute":"88","Second":"89","Timezone":"90"},{"item":0},{"item":0},"facebook","instagram","tiktok",{"id":"91","participant":"63","responsibility":"92"},{"id":"93","participant":"94","responsibility":"95"},"Hero Serum",{"id":"96","notes":"97","action":"98","dialogue":"99","duration":"100"},"Hero Product","2026-07-01T15:15:52.746+07:00","July 1st 2026, 3:15:52 pm","3:15:52 pm","Wednesday","2026","July","01","15","52","Asia/Bangkok (UTC+07:00)","1","Presenter","2","วิชัย สร้างสรรค์","Camera","s1","Close-up macro","Open with product shot","สวัสดีค่ะ วันนี้มาแนะนำ Hero Serum","0:00-0:15"]	958f9d58-aa29-4953-914f-a5f61de89b26
11	{"id":"Si28JZdUotdLzill","name":"content post","nodes":[{"parameters":{"notice":"","rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"curlImport":"","method":"GET","url":"http://app:3000/api/content/scheduled","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":false,"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"fieldToSplitOut":"items","include":"noOtherFields","options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"},{"parameters":{"curlImport":"","method":"PATCH","url":"=\\t http://app:3000/api/content/{{ $json.id }}","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":true,"contentType":"json","specifyBody":"keypair","bodyParameters":{"parameters":[{"name":"status","value":"posted"}]},"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[672,0],"id":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","name":"HTTP Request1"}],"connections":{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]},"Split Out":{"main":[[{"node":"HTTP Request1","type":"main","index":0}]]}},"settings":{"executionOrder":"v1","binaryMode":"separate","availableInMCP":false}}	[{"version":1,"startData":"1","resultData":"2","executionData":"3","resumeToken":"4"},{"destinationNode":"5","runNodeFilter":"6"},{"runData":"7","pinData":"8","lastNodeExecuted":"9"},{"contextData":"10","nodeExecutionStack":"11","metadata":"12","waitingExecution":"13","waitingExecutionSource":"14","runtimeData":"15"},"d4f7f052874ad4ce792f684ad9a2c3cd6f80ac81d9066f7c05db1ba43de878af",{"nodeName":"9","mode":"16"},["17","18","9","19"],{"Schedule Trigger":"20","HTTP Request":"21","Split Out":"22","HTTP Request1":"23"},{},"HTTP Request1",{"node:HTTP Request1":"24"},[],{},{},{},{"version":1,"establishedAt":1782893909433,"source":"25","triggerNode":"26","redaction":"27","credentials":"28"},"inclusive","Schedule Trigger","Split Out","HTTP Request",["29"],["30"],["31"],["32"],{"response":"33"},"manual",{"name":"18","type":"34"},{"version":2,"production":false,"manual":false,"source":"35"},"U2FsdGVkX18JFCSe23mJzwzxksKrPr7VioGAENECs+oGOvQCqSv7/uTkQT3LTvYYGBpAXCLhNetRwaHXXWb3BbzKA7baZiTs0n0K101bvJ/HaBK9/iXNduemNkFdDpGcLm4EjNsDy/EYF80HuCcL80L8bMaOu7EoiOdBNkibr1hJlBIkfaNbcIANIbGjDeG0vugPJKJKx3Lq6sH7mbGjYp2VOYauyqlSjVjXw0D0XeVA6q9X/v6cFMl1hTT4fofIMlBrpI71LxS7x2dLwZPCRqz5cp0pof/NO0z2j8b7Ol4RC1ZPJSbiZ7iR9tO0yJnigGf43w5Ah3FXSlPPQKmFqtH18NSh769tgULrhhNrDLyXiNV9xAJ8R9pIzhFdLESdG6hYxsAYqldhjOUvGD/uj4TrLcxWW7g+pZ4PHBPI3iL+TqO5TOxHmo5uhCAUHEjGLjhPkQTw9eNm21ZcUVVbGDspnYE7enV8ZWs692HLIqrB+FcV9YdM/XjDp2JaX7zIn16/68hlptRT88AxIBxosQ==",{"startTime":1782893752744,"executionIndex":0,"source":"36","hints":"37","executionTime":3,"executionStatus":"38","data":"39"},{"startTime":1782893899502,"executionIndex":1,"source":"40","hints":"41","executionTime":24,"executionStatus":"38","data":"42"},{"startTime":1782893909440,"executionIndex":2,"source":"43","hints":"44","executionTime":1,"executionStatus":"38","data":"45"},{"startTime":1782893909442,"executionIndex":3,"source":"46","hints":"47","executionTime":590,"executionStatus":"38","data":"48"},{"body":"49"},"n8n-nodes-base.splitOut","workflow",[],[],"success",{"main":"50"},["51"],[],{"main":"52"},["53"],[],{"main":"54"},["55"],[],{"main":"56"},{"id":"57","contentId":"58","name":"59","mediaType":"60","channel":"61","platforms":"62","details":"63","location":"64","scheduledDate":"65","scheduledTime":"66","endTime":"67","team":"68","productsNeeded":"69","itemsToPrepare":"70","attachments":"71","script":"72","ideaCreator":"73","photographer":"74","editor":"75","status":"76","category":"77","tags":"78","createdAt":"79"},["80"],{"previousNode":"17","previousNodeOutput":0,"previousNodeRun":0},["81"],{"previousNode":"19","previousNodeOutput":0,"previousNodeRun":0},["82"],{"previousNode":"18","previousNodeOutput":0,"previousNodeRun":0},["83"],"cmr1rufqi00035auii7ehwyie","10001","Hero Serum Launch Video","video","Official",["84","85","86"],"วิดีโอเปิดตัว Hero Serum สไตล์ lifestyle herbal","Studio A","2026-06-15","10:00","12:00",["87","88"],["89"],"Backdrop สีเขียว, Props สมุนไพร",[],["90"],"Laura Power","พิมพ์ใจ ถ่ายทำ","กนก ตัดต่อ","posted","Hero Video",["91"],"2026-07-01T07:46:09.066Z",["92"],["93"],["94"],["95"],"facebook","instagram","tiktok",{"id":"96","participant":"73","responsibility":"97"},{"id":"98","participant":"99","responsibility":"100"},"Hero Serum",{"id":"101","notes":"102","action":"103","dialogue":"104","duration":"105"},"Hero Product",{"json":"106","pairedItem":"107"},{"json":"108","pairedItem":"109"},{"json":"110","pairedItem":"111"},{"json":"49","pairedItem":"112"},"1","Presenter","2","วิชัย สร้างสรรค์","Camera","s1","Close-up macro","Open with product shot","สวัสดีค่ะ วันนี้มาแนะนำ Hero Serum","0:00-0:15",{"timestamp":"113","Readable date":"114","Readable time":"115","Day of week":"116","Year":"117","Month":"118","Day of month":"119","Hour":"120","Minute":"120","Second":"121","Timezone":"122"},{"item":0},{"count":1,"items":"123"},{"item":0},{"id":"57","contentId":"58","name":"59","mediaType":"60","channel":"61","platforms":"124","details":"63","location":"64","scheduledDate":"65","scheduledTime":"66","endTime":"67","team":"125","productsNeeded":"126","itemsToPrepare":"70","attachments":"127","script":"128","ideaCreator":"73","photographer":"74","editor":"75","status":"129","category":"77","tags":"130","createdAt":"79"},{"item":0},{"item":0},"2026-07-01T15:15:52.746+07:00","July 1st 2026, 3:15:52 pm","3:15:52 pm","Wednesday","2026","July","01","15","52","Asia/Bangkok (UTC+07:00)",["131"],["84","85","86"],["132","133"],["89"],[],["134"],"approved",["91"],{"id":"57","contentId":"58","name":"59","mediaType":"60","channel":"61","platforms":"124","details":"63","location":"64","scheduledDate":"65","scheduledTime":"66","endTime":"67","team":"125","productsNeeded":"126","itemsToPrepare":"70","attachments":"127","script":"128","ideaCreator":"73","photographer":"74","editor":"75","status":"129","category":"77","tags":"130","createdAt":"79"},{"id":"96","participant":"73","responsibility":"97"},{"id":"98","participant":"99","responsibility":"100"},{"id":"101","notes":"102","action":"103","dialogue":"104","duration":"105"}]	958f9d58-aa29-4953-914f-a5f61de89b26
19	{"id":"Si28JZdUotdLzill","name":"content post","nodes":[{"parameters":{"notice":"","rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"curlImport":"","method":"GET","url":"http://app:3000/api/content/scheduled","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":false,"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"fieldToSplitOut":"items","include":"noOtherFields","options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"},{"parameters":{"curlImport":"","method":"PATCH","url":"=\\t http://app:3000/api/content/{{ $json.id }}","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":true,"contentType":"json","specifyBody":"keypair","bodyParameters":{"parameters":[{"name":"status","value":"posted"}]},"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[672,0],"id":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","name":"HTTP Request1"}],"connections":{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]},"Split Out":{"main":[[{"node":"HTTP Request1","type":"main","index":0}]]}},"settings":{"executionOrder":"v1","binaryMode":"separate","availableInMCP":false}}	[{"version":1,"startData":"1","resultData":"2","executionData":"3","resumeToken":"4"},{},{"runData":"5","lastNodeExecuted":"6"},{"contextData":"7","nodeExecutionStack":"8","metadata":"9","waitingExecution":"10","waitingExecutionSource":"11","runtimeData":"12"},"985fe2f0be048d0216ec3ce1810275542f26c3574be73260d08ad02456d5148a",{"Schedule Trigger":"13","HTTP Request":"14","Split Out":"15"},"Split Out",{},[],{},{},{},{"version":1,"establishedAt":1782900938024,"source":"16","triggerNode":"17","redaction":"18"},["19"],["20"],["21"],"trigger",{"name":"22","type":"23"},{"version":2,"production":false,"manual":false,"source":"24"},{"startTime":1782900938051,"executionIndex":0,"source":"25","hints":"26","executionTime":0,"executionStatus":"27","data":"28"},{"startTime":1782900938051,"executionIndex":1,"source":"29","hints":"30","executionTime":236,"executionStatus":"27","data":"31"},{"startTime":1782900938288,"executionIndex":2,"source":"32","hints":"33","executionTime":0,"executionStatus":"27","data":"34"},"Schedule Trigger","n8n-nodes-base.scheduleTrigger","workflow",[],[],"success",{"main":"35"},["36"],[],{"main":"37"},["38"],[],{"main":"39"},["40"],{"previousNode":"22","previousNodeOutput":0,"previousNodeRun":0},["41"],{"previousNode":"42","previousNodeOutput":0,"previousNodeRun":0},["43"],["44"],["45"],"HTTP Request",[],{"json":"46","pairedItem":"47"},{"json":"48","pairedItem":"49"},{"timestamp":"50","Readable date":"51","Readable time":"52","Day of week":"53","Year":"54","Month":"55","Day of month":"56","Hour":"57","Minute":"58","Second":"59","Timezone":"60"},{"item":0},{"count":0,"items":"61"},{"item":0},"2026-07-01T17:15:38.021+07:00","July 1st 2026, 5:15:38 pm","5:15:38 pm","Wednesday","2026","July","01","17","15","38","Asia/Bangkok (UTC+07:00)",[]]	958f9d58-aa29-4953-914f-a5f61de89b26
12	{"id":"Si28JZdUotdLzill","name":"content post","nodes":[{"parameters":{"notice":"","rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"curlImport":"","method":"GET","url":"http://app:3000/api/content/scheduled","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":false,"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"fieldToSplitOut":"items","include":"noOtherFields","options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"},{"parameters":{"curlImport":"","method":"PATCH","url":"=\\t http://app:3000/api/content/{{ $json.id }}","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":true,"contentType":"json","specifyBody":"keypair","bodyParameters":{"parameters":[{"name":"status","value":"posted"}]},"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[672,0],"id":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","name":"HTTP Request1"}],"connections":{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]},"Split Out":{"main":[[{"node":"HTTP Request1","type":"main","index":0}]]}},"settings":{"executionOrder":"v1","binaryMode":"separate","availableInMCP":false}}	[{"version":1,"startData":"1","resultData":"2","executionData":"3","resumeToken":"4"},{},{"runData":"5","lastNodeExecuted":"6"},{"contextData":"7","nodeExecutionStack":"8","metadata":"9","waitingExecution":"10","waitingExecutionSource":"11","runtimeData":"12"},"78a50bf8c799033508ba4d935c1b274dadb57705d5c383ce779a260c9f53aeae",{"Schedule Trigger":"13","HTTP Request":"14","Split Out":"15"},"Split Out",{},[],{},{},{},{"version":1,"establishedAt":1782894638038,"source":"16","triggerNode":"17","redaction":"18"},["19"],["20"],["21"],"trigger",{"name":"22","type":"23"},{"version":2,"production":false,"manual":false,"source":"24"},{"startTime":1782894638059,"executionIndex":0,"source":"25","hints":"26","executionTime":1,"executionStatus":"27","data":"28"},{"startTime":1782894638060,"executionIndex":1,"source":"29","hints":"30","executionTime":281,"executionStatus":"27","data":"31"},{"startTime":1782894638341,"executionIndex":2,"source":"32","hints":"33","executionTime":0,"executionStatus":"27","data":"34"},"Schedule Trigger","n8n-nodes-base.scheduleTrigger","workflow",[],[],"success",{"main":"35"},["36"],[],{"main":"37"},["38"],[],{"main":"39"},["40"],{"previousNode":"22","previousNodeOutput":0,"previousNodeRun":0},["41"],{"previousNode":"42","previousNodeOutput":0,"previousNodeRun":0},["43"],["44"],["45"],"HTTP Request",[],{"json":"46","pairedItem":"47"},{"json":"48","pairedItem":"49"},{"timestamp":"50","Readable date":"51","Readable time":"52","Day of week":"53","Year":"54","Month":"55","Day of month":"56","Hour":"57","Minute":"58","Second":"59","Timezone":"60"},{"item":0},{"count":0,"items":"61"},{"item":0},"2026-07-01T15:30:38.035+07:00","July 1st 2026, 3:30:38 pm","3:30:38 pm","Wednesday","2026","July","01","15","30","38","Asia/Bangkok (UTC+07:00)",[]]	958f9d58-aa29-4953-914f-a5f61de89b26
13	{"id":"Si28JZdUotdLzill","name":"content post","nodes":[{"parameters":{"notice":"","rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"curlImport":"","method":"GET","url":"http://app:3000/api/content/scheduled","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":false,"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"fieldToSplitOut":"items","include":"noOtherFields","options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"},{"parameters":{"curlImport":"","method":"PATCH","url":"=\\t http://app:3000/api/content/{{ $json.id }}","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":true,"contentType":"json","specifyBody":"keypair","bodyParameters":{"parameters":[{"name":"status","value":"posted"}]},"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[672,0],"id":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","name":"HTTP Request1"}],"connections":{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]},"Split Out":{"main":[[{"node":"HTTP Request1","type":"main","index":0}]]}},"settings":{"executionOrder":"v1","binaryMode":"separate","availableInMCP":false}}	[{"version":1,"startData":"1","resultData":"2","executionData":"3","resumeToken":"4"},{},{"runData":"5","lastNodeExecuted":"6"},{"contextData":"7","nodeExecutionStack":"8","metadata":"9","waitingExecution":"10","waitingExecutionSource":"11","runtimeData":"12"},"5a553f56f5b32fc9964431f133a0332322a92e628f58cc47dfde874b300e54c3",{"Schedule Trigger":"13","HTTP Request":"14","Split Out":"15"},"Split Out",{},[],{},{},{},{"version":1,"establishedAt":1782895538040,"source":"16","triggerNode":"17","redaction":"18"},["19"],["20"],["21"],"trigger",{"name":"22","type":"23"},{"version":2,"production":false,"manual":false,"source":"24"},{"startTime":1782895538075,"executionIndex":0,"source":"25","hints":"26","executionTime":1,"executionStatus":"27","data":"28"},{"startTime":1782895538076,"executionIndex":1,"source":"29","hints":"30","executionTime":205,"executionStatus":"27","data":"31"},{"startTime":1782895538281,"executionIndex":2,"source":"32","hints":"33","executionTime":1,"executionStatus":"27","data":"34"},"Schedule Trigger","n8n-nodes-base.scheduleTrigger","workflow",[],[],"success",{"main":"35"},["36"],[],{"main":"37"},["38"],[],{"main":"39"},["40"],{"previousNode":"22","previousNodeOutput":0,"previousNodeRun":0},["41"],{"previousNode":"42","previousNodeOutput":0,"previousNodeRun":0},["43"],["44"],["45"],"HTTP Request",[],{"json":"46","pairedItem":"47"},{"json":"48","pairedItem":"49"},{"timestamp":"50","Readable date":"51","Readable time":"52","Day of week":"53","Year":"54","Month":"55","Day of month":"56","Hour":"57","Minute":"58","Second":"59","Timezone":"60"},{"item":0},{"count":0,"items":"61"},{"item":0},"2026-07-01T15:45:38.033+07:00","July 1st 2026, 3:45:38 pm","3:45:38 pm","Wednesday","2026","July","01","15","45","38","Asia/Bangkok (UTC+07:00)",[]]	958f9d58-aa29-4953-914f-a5f61de89b26
14	{"id":"Si28JZdUotdLzill","name":"content post","nodes":[{"parameters":{"notice":"","rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"curlImport":"","method":"GET","url":"http://app:3000/api/content/scheduled","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":false,"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"fieldToSplitOut":"items","include":"noOtherFields","options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"},{"parameters":{"curlImport":"","method":"PATCH","url":"=\\t http://app:3000/api/content/{{ $json.id }}","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":true,"contentType":"json","specifyBody":"keypair","bodyParameters":{"parameters":[{"name":"status","value":"posted"}]},"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[672,0],"id":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","name":"HTTP Request1"}],"connections":{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]},"Split Out":{"main":[[{"node":"HTTP Request1","type":"main","index":0}]]}},"settings":{"executionOrder":"v1","binaryMode":"separate","availableInMCP":false}}	[{"version":1,"startData":"1","resultData":"2","executionData":"3","resumeToken":"4"},{},{"runData":"5","lastNodeExecuted":"6"},{"contextData":"7","nodeExecutionStack":"8","metadata":"9","waitingExecution":"10","waitingExecutionSource":"11","runtimeData":"12"},"9a385f085f7eb1b573671ad30d27c6fc759d35ef2b0731f28a809baaeed21ffb",{"Schedule Trigger":"13","HTTP Request":"14","Split Out":"15"},"Split Out",{},[],{},{},{},{"version":1,"establishedAt":1782896438040,"source":"16","triggerNode":"17","redaction":"18"},["19"],["20"],["21"],"trigger",{"name":"22","type":"23"},{"version":2,"production":false,"manual":false,"source":"24"},{"startTime":1782896438071,"executionIndex":0,"source":"25","hints":"26","executionTime":0,"executionStatus":"27","data":"28"},{"startTime":1782896438071,"executionIndex":1,"source":"29","hints":"30","executionTime":72,"executionStatus":"27","data":"31"},{"startTime":1782896438143,"executionIndex":2,"source":"32","hints":"33","executionTime":0,"executionStatus":"27","data":"34"},"Schedule Trigger","n8n-nodes-base.scheduleTrigger","workflow",[],[],"success",{"main":"35"},["36"],[],{"main":"37"},["38"],[],{"main":"39"},["40"],{"previousNode":"22","previousNodeOutput":0,"previousNodeRun":0},["41"],{"previousNode":"42","previousNodeOutput":0,"previousNodeRun":0},["43"],["44"],["45"],"HTTP Request",[],{"json":"46","pairedItem":"47"},{"json":"48","pairedItem":"49"},{"timestamp":"50","Readable date":"51","Readable time":"52","Day of week":"53","Year":"54","Month":"55","Day of month":"56","Hour":"57","Minute":"58","Second":"59","Timezone":"60"},{"item":0},{"count":0,"items":"61"},{"item":0},"2026-07-01T16:00:38.036+07:00","July 1st 2026, 4:00:38 pm","4:00:38 pm","Wednesday","2026","July","01","16","00","38","Asia/Bangkok (UTC+07:00)",[]]	958f9d58-aa29-4953-914f-a5f61de89b26
16	{"id":"Si28JZdUotdLzill","name":"content post","nodes":[{"parameters":{"notice":"","rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"curlImport":"","method":"GET","url":"http://app:3000/api/content/scheduled","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":false,"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"fieldToSplitOut":"items","include":"noOtherFields","options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"},{"parameters":{"curlImport":"","method":"PATCH","url":"=\\t http://app:3000/api/content/{{ $json.id }}","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":true,"contentType":"json","specifyBody":"keypair","bodyParameters":{"parameters":[{"name":"status","value":"posted"}]},"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[672,0],"id":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","name":"HTTP Request1"}],"connections":{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]},"Split Out":{"main":[[{"node":"HTTP Request1","type":"main","index":0}]]}},"settings":{"executionOrder":"v1","binaryMode":"separate","availableInMCP":false}}	[{"version":1,"startData":"1","resultData":"2","executionData":"3","resumeToken":"4"},{},{"runData":"5","lastNodeExecuted":"6"},{"contextData":"7","nodeExecutionStack":"8","metadata":"9","waitingExecution":"10","waitingExecutionSource":"11","runtimeData":"12"},"0e971bd9f54ba1229987f80703235364289ce9a09dd6a85cb82bcf52cdf5d293",{"Schedule Trigger":"13","HTTP Request":"14","Split Out":"15","HTTP Request1":"16"},"HTTP Request1",{},[],{},{},{},{"version":1,"establishedAt":1782898238030,"source":"17","triggerNode":"18","redaction":"19"},["20"],["21"],["22"],["23"],"trigger",{"name":"24","type":"25"},{"version":2,"production":false,"manual":false,"source":"26"},{"startTime":1782898238068,"executionIndex":0,"source":"27","hints":"28","executionTime":0,"executionStatus":"29","data":"30"},{"startTime":1782898238068,"executionIndex":1,"source":"31","hints":"32","executionTime":335,"executionStatus":"29","data":"33"},{"startTime":1782898238404,"executionIndex":2,"source":"34","hints":"35","executionTime":0,"executionStatus":"29","data":"36"},{"startTime":1782898238404,"executionIndex":3,"source":"37","hints":"38","executionTime":565,"executionStatus":"29","data":"39"},"Schedule Trigger","n8n-nodes-base.scheduleTrigger","workflow",[],[],"success",{"main":"40"},["41"],[],{"main":"42"},["43"],[],{"main":"44"},["45"],[],{"main":"46"},["47"],{"previousNode":"24","previousNodeOutput":0,"previousNodeRun":0},["48"],{"previousNode":"49","previousNodeOutput":0,"previousNodeRun":0},["50"],{"previousNode":"51","previousNodeOutput":0,"previousNodeRun":0},["52"],["53"],["54"],"HTTP Request",["55","56","57"],"Split Out",["58","59","60"],{"json":"61","pairedItem":"62"},{"json":"63","pairedItem":"64"},{"json":"65","pairedItem":"66"},{"json":"67","pairedItem":"68"},{"json":"69","pairedItem":"70"},{"json":"71","pairedItem":"72"},{"json":"73","pairedItem":"74"},{"json":"75","pairedItem":"76"},{"timestamp":"77","Readable date":"78","Readable time":"79","Day of week":"80","Year":"81","Month":"82","Day of month":"83","Hour":"84","Minute":"85","Second":"86","Timezone":"87"},{"item":0},{"count":3,"items":"88"},{"item":0},{"id":"89","contentId":"90","name":"91","mediaType":"92","channel":"93","platforms":"94","details":"95","location":"96","scheduledDate":"97","scheduledTime":"98","endTime":"99","team":"100","productsNeeded":"101","itemsToPrepare":"102","attachments":"103","script":"104","ideaCreator":"105","photographer":"106","editor":"107","approver":"108","status":"109","category":"110","tags":"111","createdAt":"112"},{"item":0},{"id":"113","contentId":"114","name":"115","mediaType":"116","channel":"117","platforms":"118","details":"119","location":"120","scheduledDate":"121","scheduledTime":"122","endTime":"123","team":"124","productsNeeded":"125","itemsToPrepare":"126","attachments":"127","script":"128","ideaCreator":"129","photographer":"106","editor":"107","approver":"108","status":"109","category":"130","tags":"131","createdAt":"132"},{"item":0},{"id":"133","contentId":"134","name":"135","mediaType":"92","channel":"136","platforms":"137","details":"138","location":"120","scheduledDate":"139","scheduledTime":"140","endTime":"141","team":"142","productsNeeded":"143","itemsToPrepare":"144","attachments":"145","script":"146","ideaCreator":"144","photographer":"144","editor":"144","approver":"108","status":"109","category":"147","tags":"148","createdAt":"149"},{"item":0},{"id":"89","contentId":"90","name":"91","mediaType":"92","channel":"93","platforms":"150","details":"95","location":"96","scheduledDate":"97","scheduledTime":"98","endTime":"99","team":"151","productsNeeded":"152","itemsToPrepare":"102","attachments":"153","script":"154","ideaCreator":"105","photographer":"106","editor":"107","approver":"108","status":"155","category":"110","tags":"156","createdAt":"112"},{"item":0},{"id":"113","contentId":"114","name":"115","mediaType":"116","channel":"117","platforms":"157","details":"119","location":"120","scheduledDate":"121","scheduledTime":"122","endTime":"123","team":"158","productsNeeded":"159","itemsToPrepare":"126","attachments":"160","script":"161","ideaCreator":"129","photographer":"106","editor":"107","approver":"108","status":"155","category":"130","tags":"162","createdAt":"132"},{"item":1},{"id":"133","contentId":"134","name":"135","mediaType":"92","channel":"136","platforms":"163","details":"138","location":"120","scheduledDate":"139","scheduledTime":"140","endTime":"141","team":"164","productsNeeded":"165","itemsToPrepare":"144","attachments":"166","script":"167","ideaCreator":"144","photographer":"144","editor":"144","approver":"108","status":"155","category":"147","tags":"168","createdAt":"149"},{"item":2},"2026-07-01T16:30:38.025+07:00","July 1st 2026, 4:30:38 pm","4:30:38 pm","Wednesday","2026","July","01","16","30","38","Asia/Bangkok (UTC+07:00)",["169","170","171"],"cmr1rufqt00055aui84y790ed","10002","Farm Fresh Behind the Scenes","video","วังน้ำเขียวฟาร์ม",["172","173","174"],"Behind the scenes การเก็บเกี่ยวสมุนไพรที่ฟาร์ม","Farm Location","2026-06-17","09:00","11:00",["175"],["176"],"Outdoor mic, Drone",[],[],"มานี มีสุข","พิมพ์ใจ ถ่ายทำ","กนก ตัดต่อ","Admin","approved","Behind the Scenes",["177"],"2026-07-01T07:46:09.077Z","cmr1rufqx00075aui3pbp77di","10003","Gift Set Teaser","image","ของชำร่วย",["178","179"],"ภาพ Teaser ชุดของขวัญสมุนไพร","Studio A","2026-06-18","14:00","15:00",[],["180"],"Ribbon, Gift box props",[],[],"Laura Power","Recap / Teaser",["181"],"2026-07-01T07:46:09.081Z","cmr1vieqc0001qp6srbw9bth0","15067","gumo","สายพี่ป๋อง",["173","178"],"vegetable gummy bear","2026-07-01","16:28","19:48",["182"],[],"",[],[],"Hero Video",[],"2026-07-01T09:28:46.357Z",["172","173","174"],["183"],["176"],[],[],"posted",["177"],["178","179"],[],["180"],[],[],["181"],["173","178"],["184"],[],[],[],[],{"id":"89","contentId":"90","name":"91","mediaType":"92","channel":"93","platforms":"94","details":"95","location":"96","scheduledDate":"97","scheduledTime":"98","endTime":"99","team":"100","productsNeeded":"101","itemsToPrepare":"102","attachments":"103","script":"104","ideaCreator":"105","photographer":"106","editor":"107","approver":"108","status":"109","category":"110","tags":"111","createdAt":"112"},{"id":"113","contentId":"114","name":"115","mediaType":"116","channel":"117","platforms":"118","details":"119","location":"120","scheduledDate":"121","scheduledTime":"122","endTime":"123","team":"124","productsNeeded":"125","itemsToPrepare":"126","attachments":"127","script":"128","ideaCreator":"129","photographer":"106","editor":"107","approver":"108","status":"109","category":"130","tags":"131","createdAt":"132"},{"id":"133","contentId":"134","name":"135","mediaType":"92","channel":"136","platforms":"137","details":"138","location":"120","scheduledDate":"139","scheduledTime":"140","endTime":"141","team":"142","productsNeeded":"143","itemsToPrepare":"144","attachments":"145","script":"146","ideaCreator":"144","photographer":"144","editor":"144","approver":"108","status":"109","category":"147","tags":"148","createdAt":"149"},"facebook","tiktok","line",{"id":"185","participant":"105","responsibility":"186"},"Herbal Tea Set","Farm","instagram","lemon8","Gift Set","Gift",{"id":"187","participant":"129","responsibility":"186"},{"id":"185","participant":"105","responsibility":"186"},{"id":"187","participant":"129","responsibility":"186"},"1","Presenter","f7d225e0-d407-4f5b-8b49-14ffd1dd8f0e"]	958f9d58-aa29-4953-914f-a5f61de89b26
17	{"id":"Si28JZdUotdLzill","name":"content post","nodes":[{"parameters":{"notice":"","rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"curlImport":"","method":"GET","url":"http://app:3000/api/content/scheduled","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":false,"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"fieldToSplitOut":"items","include":"noOtherFields","options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"},{"parameters":{"curlImport":"","method":"PATCH","url":"=\\t http://app:3000/api/content/{{ $json.id }}","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":true,"contentType":"json","specifyBody":"keypair","bodyParameters":{"parameters":[{"name":"status","value":"posted"}]},"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[672,0],"id":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","name":"HTTP Request1"}],"connections":{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]},"Split Out":{"main":[[{"node":"HTTP Request1","type":"main","index":0}]]}},"settings":{"executionOrder":"v1","binaryMode":"separate","availableInMCP":false}}	[{"version":1,"startData":"1","resultData":"2","executionData":"3","resumeToken":"4"},{},{"runData":"5","lastNodeExecuted":"6"},{"contextData":"7","nodeExecutionStack":"8","metadata":"9","waitingExecution":"10","waitingExecutionSource":"11","runtimeData":"12"},"2a603f2624cc28a6b6c35aa9d92c04d6764e5f12e84f37db235ef78e5f444338",{"Schedule Trigger":"13","HTTP Request":"14","Split Out":"15"},"Split Out",{},[],{},{},{},{"version":1,"establishedAt":1782899138048,"source":"16","triggerNode":"17","redaction":"18"},["19"],["20"],["21"],"trigger",{"name":"22","type":"23"},{"version":2,"production":false,"manual":false,"source":"24"},{"startTime":1782899138076,"executionIndex":0,"source":"25","hints":"26","executionTime":0,"executionStatus":"27","data":"28"},{"startTime":1782899138076,"executionIndex":1,"source":"29","hints":"30","executionTime":1472,"executionStatus":"27","data":"31"},{"startTime":1782899139548,"executionIndex":2,"source":"32","hints":"33","executionTime":0,"executionStatus":"27","data":"34"},"Schedule Trigger","n8n-nodes-base.scheduleTrigger","workflow",[],[],"success",{"main":"35"},["36"],[],{"main":"37"},["38"],[],{"main":"39"},["40"],{"previousNode":"22","previousNodeOutput":0,"previousNodeRun":0},["41"],{"previousNode":"42","previousNodeOutput":0,"previousNodeRun":0},["43"],["44"],["45"],"HTTP Request",[],{"json":"46","pairedItem":"47"},{"json":"48","pairedItem":"49"},{"timestamp":"50","Readable date":"51","Readable time":"52","Day of week":"53","Year":"54","Month":"55","Day of month":"56","Hour":"57","Minute":"58","Second":"59","Timezone":"60"},{"item":0},{"count":0,"items":"61"},{"item":0},"2026-07-01T16:45:38.043+07:00","July 1st 2026, 4:45:38 pm","4:45:38 pm","Wednesday","2026","July","01","16","45","38","Asia/Bangkok (UTC+07:00)",[]]	958f9d58-aa29-4953-914f-a5f61de89b26
18	{"id":"Si28JZdUotdLzill","name":"content post","nodes":[{"parameters":{"notice":"","rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"curlImport":"","method":"GET","url":"http://app:3000/api/content/scheduled","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":false,"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"fieldToSplitOut":"items","include":"noOtherFields","options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"},{"parameters":{"curlImport":"","method":"PATCH","url":"=\\t http://app:3000/api/content/{{ $json.id }}","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":true,"contentType":"json","specifyBody":"keypair","bodyParameters":{"parameters":[{"name":"status","value":"posted"}]},"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[672,0],"id":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","name":"HTTP Request1"}],"connections":{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]},"Split Out":{"main":[[{"node":"HTTP Request1","type":"main","index":0}]]}},"settings":{"executionOrder":"v1","binaryMode":"separate","availableInMCP":false}}	[{"version":1,"startData":"1","resultData":"2","executionData":"3","resumeToken":"4"},{},{"runData":"5","lastNodeExecuted":"6"},{"contextData":"7","nodeExecutionStack":"8","metadata":"9","waitingExecution":"10","waitingExecutionSource":"11","runtimeData":"12"},"ee3d96a1db52da19cbd24f041481d19f5b68a626793e68528ec56ed2c7340798",{"Schedule Trigger":"13","HTTP Request":"14","Split Out":"15"},"Split Out",{},[],{},{},{},{"version":1,"establishedAt":1782900038050,"source":"16","triggerNode":"17","redaction":"18"},["19"],["20"],["21"],"trigger",{"name":"22","type":"23"},{"version":2,"production":false,"manual":false,"source":"24"},{"startTime":1782900038082,"executionIndex":0,"source":"25","hints":"26","executionTime":0,"executionStatus":"27","data":"28"},{"startTime":1782900038082,"executionIndex":1,"source":"29","hints":"30","executionTime":214,"executionStatus":"27","data":"31"},{"startTime":1782900038296,"executionIndex":2,"source":"32","hints":"33","executionTime":0,"executionStatus":"27","data":"34"},"Schedule Trigger","n8n-nodes-base.scheduleTrigger","workflow",[],[],"success",{"main":"35"},["36"],[],{"main":"37"},["38"],[],{"main":"39"},["40"],{"previousNode":"22","previousNodeOutput":0,"previousNodeRun":0},["41"],{"previousNode":"42","previousNodeOutput":0,"previousNodeRun":0},["43"],["44"],["45"],"HTTP Request",[],{"json":"46","pairedItem":"47"},{"json":"48","pairedItem":"49"},{"timestamp":"50","Readable date":"51","Readable time":"52","Day of week":"53","Year":"54","Month":"55","Day of month":"56","Hour":"57","Minute":"58","Second":"59","Timezone":"60"},{"item":0},{"count":0,"items":"61"},{"item":0},"2026-07-01T17:00:38.048+07:00","July 1st 2026, 5:00:38 pm","5:00:38 pm","Wednesday","2026","July","01","17","00","38","Asia/Bangkok (UTC+07:00)",[]]	958f9d58-aa29-4953-914f-a5f61de89b26
20	{"id":"Si28JZdUotdLzill","name":"content post","nodes":[{"parameters":{"notice":"","rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"curlImport":"","method":"GET","url":"http://app:3000/api/content/scheduled","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":false,"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"fieldToSplitOut":"items","include":"noOtherFields","options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"},{"parameters":{"curlImport":"","method":"PATCH","url":"=\\t http://app:3000/api/content/{{ $json.id }}","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":true,"contentType":"json","specifyBody":"keypair","bodyParameters":{"parameters":[{"name":"status","value":"posted"}]},"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[672,0],"id":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","name":"HTTP Request1"}],"connections":{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]},"Split Out":{"main":[[{"node":"HTTP Request1","type":"main","index":0}]]}},"settings":{"executionOrder":"v1","binaryMode":"separate","availableInMCP":false}}	[{"version":1,"startData":"1","resultData":"2","executionData":"3","resumeToken":"4"},{},{"runData":"5","lastNodeExecuted":"6"},{"contextData":"7","nodeExecutionStack":"8","metadata":"9","waitingExecution":"10","waitingExecutionSource":"11","runtimeData":"12"},"9d3d2eb2354b8388d702abf04d4ce9679fc74111989a373460330c94b2d7096c",{"Schedule Trigger":"13","HTTP Request":"14","Split Out":"15"},"Split Out",{},[],{},{},{},{"version":1,"establishedAt":1782901838041,"source":"16","triggerNode":"17","redaction":"18"},["19"],["20"],["21"],"trigger",{"name":"22","type":"23"},{"version":2,"production":false,"manual":false,"source":"24"},{"startTime":1782901838070,"executionIndex":0,"source":"25","hints":"26","executionTime":0,"executionStatus":"27","data":"28"},{"startTime":1782901838071,"executionIndex":1,"source":"29","hints":"30","executionTime":320,"executionStatus":"27","data":"31"},{"startTime":1782901838391,"executionIndex":2,"source":"32","hints":"33","executionTime":0,"executionStatus":"27","data":"34"},"Schedule Trigger","n8n-nodes-base.scheduleTrigger","workflow",[],[],"success",{"main":"35"},["36"],[],{"main":"37"},["38"],[],{"main":"39"},["40"],{"previousNode":"22","previousNodeOutput":0,"previousNodeRun":0},["41"],{"previousNode":"42","previousNodeOutput":0,"previousNodeRun":0},["43"],["44"],["45"],"HTTP Request",[],{"json":"46","pairedItem":"47"},{"json":"48","pairedItem":"49"},{"timestamp":"50","Readable date":"51","Readable time":"52","Day of week":"53","Year":"54","Month":"55","Day of month":"56","Hour":"57","Minute":"58","Second":"59","Timezone":"60"},{"item":0},{"count":0,"items":"61"},{"item":0},"2026-07-01T17:30:38.034+07:00","July 1st 2026, 5:30:38 pm","5:30:38 pm","Wednesday","2026","July","01","17","30","38","Asia/Bangkok (UTC+07:00)",[]]	958f9d58-aa29-4953-914f-a5f61de89b26
21	{"id":"Si28JZdUotdLzill","name":"content post","nodes":[{"parameters":{"notice":"","rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"curlImport":"","method":"GET","url":"http://app:3000/api/content/scheduled","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":false,"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"fieldToSplitOut":"items","include":"noOtherFields","options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"},{"parameters":{"curlImport":"","method":"PATCH","url":"=\\t http://app:3000/api/content/{{ $json.id }}","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":true,"contentType":"json","specifyBody":"keypair","bodyParameters":{"parameters":[{"name":"status","value":"posted"}]},"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[672,0],"id":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","name":"HTTP Request1"}],"connections":{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]},"Split Out":{"main":[[{"node":"HTTP Request1","type":"main","index":0}]]}},"settings":{"executionOrder":"v1","binaryMode":"separate","availableInMCP":false}}	[{"version":1,"startData":"1","resultData":"2","executionData":"3","resumeToken":"4"},{},{"error":"5","runData":"6","lastNodeExecuted":"7"},{"contextData":"8","nodeExecutionStack":"9","metadata":"10","waitingExecution":"11","waitingExecutionSource":"12","runtimeData":"13"},"72bf6756e21c6568c1af9f8f45bb11d528ff0ea9f813d5dc5e4f2061bb1921ff",{"level":"14","tags":"15","description":"16","timestamp":1782902738281,"context":"17","functionality":"18","name":"19","node":"20","messages":"21","httpCode":"22","message":"23","stack":"24"},{"Schedule Trigger":"25","HTTP Request":"26"},"HTTP Request",{},["27"],{},{},{},{"version":1,"establishedAt":1782902738064,"source":"28","triggerNode":"29","redaction":"30"},"warning",{},"500 - \\"\\"",{"itemIndex":0,"request":"31"},"regular","NodeApiError",{"parameters":"32","type":"33","typeVersion":4.4,"position":"34","id":"35","name":"7"},["16"],"500","The service was not able to process your request","NodeApiError: The service was not able to process your request\\n    at ExecuteContext.execute (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-nodes-base@file+packages+nodes-base_@aws-sdk+credential-providers@3.808.0_asn1.js@5_8da18263ca0574b0db58d4fefd8173ce/node_modules/n8n-nodes-base/nodes/HttpRequest/V3/HttpRequestV3.node.ts:869:16)\\n    at processTicksAndRejections (node:internal/process/task_queues:104:5)\\n    at WorkflowExecute.executeNode (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1067:8)\\n    at WorkflowExecute.runNode (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1367:11)\\n    at /usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1829:27\\n    at /usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:2521:11",["36"],["37"],{"node":"38","data":"39","source":"40"},"trigger",{"name":"41","type":"42"},{"version":2,"production":false,"manual":false,"source":"43"},{"headers":"44","method":"45","uri":"46","gzip":true,"rejectUnauthorized":true,"followRedirect":true,"resolveWithFullResponse":true,"sendCredentialsOnCrossOriginRedirect":false,"followAllRedirects":true,"timeout":300000,"encoding":null,"json":false,"useStream":true},{"curlImport":"47","method":"45","url":"46","authentication":"48","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"49","headerParameters":"50","sendBody":false,"options":"51","infoMessage":"47"},"n8n-nodes-base.httpRequest",[256,0],"c38b27ff-6b94-479f-be61-d469406da108",{"startTime":1782902738108,"executionIndex":0,"source":"52","hints":"53","executionTime":1,"executionStatus":"54","data":"55"},{"startTime":1782902738109,"executionIndex":1,"source":"56","hints":"57","executionTime":173,"executionStatus":"58","error":"59"},{"parameters":"60","type":"33","typeVersion":4.4,"position":"61","id":"35","name":"7"},{"main":"62"},{"main":"56"},"Schedule Trigger","n8n-nodes-base.scheduleTrigger","workflow",{"x-api-key":"63","accept":"64"},"GET","http://app:3000/api/content/scheduled","","none","keypair",{"parameters":"65"},{},[],[],"success",{"main":"66"},["67"],[],"error",{"level":"14","tags":"15","description":"16","timestamp":1782902738281,"context":"17","functionality":"18","name":"19","node":"20","messages":"21","httpCode":"22","message":"23","stack":"24"},{"curlImport":"47","method":"45","url":"46","authentication":"48","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"49","headerParameters":"68","sendBody":false,"options":"69","infoMessage":"47"},[256,0],["70"],"**hidden**","application/json,text/html,application/xhtml+xml,application/xml,text/*;q=0.9, image/*;q=0.8, */*;q=0.7",["71"],["72"],{"previousNode":"41","previousNodeOutput":0,"previousNodeRun":0},{"parameters":"73"},{},["74"],{"name":"75","value":"76"},["77"],["78"],{"json":"79","pairedItem":"80"},"x-api-key","dev-n8n-api-key-change-in-production",{"json":"79","pairedItem":"81"},{"name":"75","value":"76"},{"timestamp":"82","Readable date":"83","Readable time":"84","Day of week":"85","Year":"86","Month":"87","Day of month":"88","Hour":"89","Minute":"90","Second":"91","Timezone":"92"},{"item":0},{"item":0},"2026-07-01T17:45:38.050+07:00","July 1st 2026, 5:45:38 pm","5:45:38 pm","Wednesday","2026","July","01","17","45","38","Asia/Bangkok (UTC+07:00)"]	958f9d58-aa29-4953-914f-a5f61de89b26
22	{"id":"Si28JZdUotdLzill","name":"content post","nodes":[{"parameters":{"notice":"","rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"curlImport":"","method":"GET","url":"http://app:3000/api/content/scheduled","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":false,"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"fieldToSplitOut":"items","include":"noOtherFields","options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"},{"parameters":{"curlImport":"","method":"PATCH","url":"=\\t http://app:3000/api/content/{{ $json.id }}","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":true,"contentType":"json","specifyBody":"keypair","bodyParameters":{"parameters":[{"name":"status","value":"posted"}]},"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[672,0],"id":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","name":"HTTP Request1"}],"connections":{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]},"Split Out":{"main":[[{"node":"HTTP Request1","type":"main","index":0}]]}},"settings":{"executionOrder":"v1","binaryMode":"separate","availableInMCP":false}}	[{"version":1,"startData":"1","resultData":"2","executionData":"3","resumeToken":"4"},{},{"error":"5","runData":"6","lastNodeExecuted":"7"},{"contextData":"8","nodeExecutionStack":"9","metadata":"10","waitingExecution":"11","waitingExecutionSource":"12","runtimeData":"13"},"07841969b6d29e3865c30abb90502c8d861b5991b986fec03111c65223f0b4bd",{"level":"14","tags":"15","description":"16","timestamp":1782903638123,"context":"17","functionality":"18","name":"19","node":"20","messages":"21","httpCode":"22","message":"23","stack":"24"},{"Schedule Trigger":"25","HTTP Request":"26"},"HTTP Request",{},["27"],{},{},{},{"version":1,"establishedAt":1782903638043,"source":"28","triggerNode":"29","redaction":"30"},"warning",{},"500 - \\"\\"",{"itemIndex":0,"request":"31"},"regular","NodeApiError",{"parameters":"32","type":"33","typeVersion":4.4,"position":"34","id":"35","name":"7"},["16"],"500","The service was not able to process your request","NodeApiError: The service was not able to process your request\\n    at ExecuteContext.execute (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-nodes-base@file+packages+nodes-base_@aws-sdk+credential-providers@3.808.0_asn1.js@5_8da18263ca0574b0db58d4fefd8173ce/node_modules/n8n-nodes-base/nodes/HttpRequest/V3/HttpRequestV3.node.ts:869:16)\\n    at processTicksAndRejections (node:internal/process/task_queues:104:5)\\n    at WorkflowExecute.executeNode (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1067:8)\\n    at WorkflowExecute.runNode (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1367:11)\\n    at /usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1829:27\\n    at /usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:2521:11",["36"],["37"],{"node":"38","data":"39","source":"40"},"trigger",{"name":"41","type":"42"},{"version":2,"production":false,"manual":false,"source":"43"},{"headers":"44","method":"45","uri":"46","gzip":true,"rejectUnauthorized":true,"followRedirect":true,"resolveWithFullResponse":true,"sendCredentialsOnCrossOriginRedirect":false,"followAllRedirects":true,"timeout":300000,"encoding":null,"json":false,"useStream":true},{"curlImport":"47","method":"45","url":"46","authentication":"48","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"49","headerParameters":"50","sendBody":false,"options":"51","infoMessage":"47"},"n8n-nodes-base.httpRequest",[256,0],"c38b27ff-6b94-479f-be61-d469406da108",{"startTime":1782903638068,"executionIndex":0,"source":"52","hints":"53","executionTime":0,"executionStatus":"54","data":"55"},{"startTime":1782903638068,"executionIndex":1,"source":"56","hints":"57","executionTime":55,"executionStatus":"58","error":"59"},{"parameters":"60","type":"33","typeVersion":4.4,"position":"61","id":"35","name":"7"},{"main":"62"},{"main":"56"},"Schedule Trigger","n8n-nodes-base.scheduleTrigger","workflow",{"x-api-key":"63","accept":"64"},"GET","http://app:3000/api/content/scheduled","","none","keypair",{"parameters":"65"},{},[],[],"success",{"main":"66"},["67"],[],"error",{"level":"14","tags":"15","description":"16","timestamp":1782903638123,"context":"17","functionality":"18","name":"19","node":"20","messages":"21","httpCode":"22","message":"23","stack":"24"},{"curlImport":"47","method":"45","url":"46","authentication":"48","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"49","headerParameters":"68","sendBody":false,"options":"69","infoMessage":"47"},[256,0],["70"],"**hidden**","application/json,text/html,application/xhtml+xml,application/xml,text/*;q=0.9, image/*;q=0.8, */*;q=0.7",["71"],["72"],{"previousNode":"41","previousNodeOutput":0,"previousNodeRun":0},{"parameters":"73"},{},["74"],{"name":"75","value":"76"},["77"],["78"],{"json":"79","pairedItem":"80"},"x-api-key","dev-n8n-api-key-change-in-production",{"json":"79","pairedItem":"81"},{"name":"75","value":"76"},{"timestamp":"82","Readable date":"83","Readable time":"84","Day of week":"85","Year":"86","Month":"87","Day of month":"88","Hour":"89","Minute":"90","Second":"91","Timezone":"92"},{"item":0},{"item":0},"2026-07-01T18:00:38.039+07:00","July 1st 2026, 6:00:38 pm","6:00:38 pm","Wednesday","2026","July","01","18","00","38","Asia/Bangkok (UTC+07:00)"]	958f9d58-aa29-4953-914f-a5f61de89b26
23	{"id":"Si28JZdUotdLzill","name":"content post","nodes":[{"parameters":{"notice":"","rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"curlImport":"","method":"GET","url":"http://app:3000/api/content/scheduled","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":false,"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"fieldToSplitOut":"items","include":"noOtherFields","options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"},{"parameters":{"curlImport":"","method":"PATCH","url":"=\\t http://app:3000/api/content/{{ $json.id }}","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":true,"contentType":"json","specifyBody":"keypair","bodyParameters":{"parameters":[{"name":"status","value":"posted"}]},"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[672,0],"id":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","name":"HTTP Request1"}],"connections":{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]},"Split Out":{"main":[[{"node":"HTTP Request1","type":"main","index":0}]]}},"settings":{"executionOrder":"v1","binaryMode":"separate","availableInMCP":false}}	[{"version":1,"startData":"1","resultData":"2","executionData":"3","resumeToken":"4"},{},{"error":"5","runData":"6","lastNodeExecuted":"7"},{"contextData":"8","nodeExecutionStack":"9","metadata":"10","waitingExecution":"11","waitingExecutionSource":"12","runtimeData":"13"},"472cf52553b821a8cad22e203e307706014173fd745c928b17f554e95175e519",{"level":"14","tags":"15","description":"16","timestamp":1782904538387,"context":"17","functionality":"18","name":"19","node":"20","messages":"21","httpCode":"22","message":"23","stack":"24"},{"Schedule Trigger":"25","HTTP Request":"26"},"HTTP Request",{},["27"],{},{},{},{"version":1,"establishedAt":1782904538057,"source":"28","triggerNode":"29","redaction":"30"},"warning",{},"500 - \\"\\"",{"itemIndex":0,"request":"31"},"regular","NodeApiError",{"parameters":"32","type":"33","typeVersion":4.4,"position":"34","id":"35","name":"7"},["16"],"500","The service was not able to process your request","NodeApiError: The service was not able to process your request\\n    at ExecuteContext.execute (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-nodes-base@file+packages+nodes-base_@aws-sdk+credential-providers@3.808.0_asn1.js@5_8da18263ca0574b0db58d4fefd8173ce/node_modules/n8n-nodes-base/nodes/HttpRequest/V3/HttpRequestV3.node.ts:869:16)\\n    at processTicksAndRejections (node:internal/process/task_queues:104:5)\\n    at WorkflowExecute.executeNode (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1067:8)\\n    at WorkflowExecute.runNode (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1367:11)\\n    at /usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1829:27\\n    at /usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:2521:11",["36"],["37"],{"node":"38","data":"39","source":"40"},"trigger",{"name":"41","type":"42"},{"version":2,"production":false,"manual":false,"source":"43"},{"headers":"44","method":"45","uri":"46","gzip":true,"rejectUnauthorized":true,"followRedirect":true,"resolveWithFullResponse":true,"sendCredentialsOnCrossOriginRedirect":false,"followAllRedirects":true,"timeout":300000,"encoding":null,"json":false,"useStream":true},{"curlImport":"47","method":"45","url":"46","authentication":"48","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"49","headerParameters":"50","sendBody":false,"options":"51","infoMessage":"47"},"n8n-nodes-base.httpRequest",[256,0],"c38b27ff-6b94-479f-be61-d469406da108",{"startTime":1782904538094,"executionIndex":0,"source":"52","hints":"53","executionTime":0,"executionStatus":"54","data":"55"},{"startTime":1782904538094,"executionIndex":1,"source":"56","hints":"57","executionTime":293,"executionStatus":"58","error":"59"},{"parameters":"60","type":"33","typeVersion":4.4,"position":"61","id":"35","name":"7"},{"main":"62"},{"main":"56"},"Schedule Trigger","n8n-nodes-base.scheduleTrigger","workflow",{"x-api-key":"63","accept":"64"},"GET","http://app:3000/api/content/scheduled","","none","keypair",{"parameters":"65"},{},[],[],"success",{"main":"66"},["67"],[],"error",{"level":"14","tags":"15","description":"16","timestamp":1782904538387,"context":"17","functionality":"18","name":"19","node":"20","messages":"21","httpCode":"22","message":"23","stack":"24"},{"curlImport":"47","method":"45","url":"46","authentication":"48","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"49","headerParameters":"68","sendBody":false,"options":"69","infoMessage":"47"},[256,0],["70"],"**hidden**","application/json,text/html,application/xhtml+xml,application/xml,text/*;q=0.9, image/*;q=0.8, */*;q=0.7",["71"],["72"],{"previousNode":"41","previousNodeOutput":0,"previousNodeRun":0},{"parameters":"73"},{},["74"],{"name":"75","value":"76"},["77"],["78"],{"json":"79","pairedItem":"80"},"x-api-key","dev-n8n-api-key-change-in-production",{"json":"79","pairedItem":"81"},{"name":"75","value":"76"},{"timestamp":"82","Readable date":"83","Readable time":"84","Day of week":"85","Year":"86","Month":"87","Day of month":"88","Hour":"89","Minute":"90","Second":"91","Timezone":"92"},{"item":0},{"item":0},"2026-07-01T18:15:38.055+07:00","July 1st 2026, 6:15:38 pm","6:15:38 pm","Wednesday","2026","July","01","18","15","38","Asia/Bangkok (UTC+07:00)"]	958f9d58-aa29-4953-914f-a5f61de89b26
24	{"id":"Si28JZdUotdLzill","name":"content post","nodes":[{"parameters":{"notice":"","rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"curlImport":"","method":"GET","url":"http://app:3000/api/content/scheduled","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":false,"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"fieldToSplitOut":"items","include":"noOtherFields","options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"},{"parameters":{"curlImport":"","method":"PATCH","url":"=\\t http://app:3000/api/content/{{ $json.id }}","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":true,"contentType":"json","specifyBody":"keypair","bodyParameters":{"parameters":[{"name":"status","value":"posted"}]},"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[672,0],"id":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","name":"HTTP Request1"}],"connections":{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]},"Split Out":{"main":[[{"node":"HTTP Request1","type":"main","index":0}]]}},"settings":{"executionOrder":"v1","binaryMode":"separate","availableInMCP":false}}	[{"version":1,"startData":"1","resultData":"2","executionData":"3","resumeToken":"4"},{},{"error":"5","runData":"6","lastNodeExecuted":"7"},{"contextData":"8","nodeExecutionStack":"9","metadata":"10","waitingExecution":"11","waitingExecutionSource":"12","runtimeData":"13"},"7c6514c94ee92aa9da4ffded80442843a1ee2e593d88ee5c8a314966468a6611",{"level":"14","tags":"15","description":"16","timestamp":1782905438111,"context":"17","functionality":"18","name":"19","node":"20","messages":"21","httpCode":"22","message":"23","stack":"24"},{"Schedule Trigger":"25","HTTP Request":"26"},"HTTP Request",{},["27"],{},{},{},{"version":1,"establishedAt":1782905438049,"source":"28","triggerNode":"29","redaction":"30"},"warning",{},"500 - \\"\\"",{"itemIndex":0,"request":"31"},"regular","NodeApiError",{"parameters":"32","type":"33","typeVersion":4.4,"position":"34","id":"35","name":"7"},["16"],"500","The service was not able to process your request","NodeApiError: The service was not able to process your request\\n    at ExecuteContext.execute (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-nodes-base@file+packages+nodes-base_@aws-sdk+credential-providers@3.808.0_asn1.js@5_8da18263ca0574b0db58d4fefd8173ce/node_modules/n8n-nodes-base/nodes/HttpRequest/V3/HttpRequestV3.node.ts:869:16)\\n    at processTicksAndRejections (node:internal/process/task_queues:104:5)\\n    at WorkflowExecute.executeNode (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1067:8)\\n    at WorkflowExecute.runNode (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1367:11)\\n    at /usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1829:27\\n    at /usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:2521:11",["36"],["37"],{"node":"38","data":"39","source":"40"},"trigger",{"name":"41","type":"42"},{"version":2,"production":false,"manual":false,"source":"43"},{"headers":"44","method":"45","uri":"46","gzip":true,"rejectUnauthorized":true,"followRedirect":true,"resolveWithFullResponse":true,"sendCredentialsOnCrossOriginRedirect":false,"followAllRedirects":true,"timeout":300000,"encoding":null,"json":false,"useStream":true},{"curlImport":"47","method":"45","url":"46","authentication":"48","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"49","headerParameters":"50","sendBody":false,"options":"51","infoMessage":"47"},"n8n-nodes-base.httpRequest",[256,0],"c38b27ff-6b94-479f-be61-d469406da108",{"startTime":1782905438071,"executionIndex":0,"source":"52","hints":"53","executionTime":1,"executionStatus":"54","data":"55"},{"startTime":1782905438072,"executionIndex":1,"source":"56","hints":"57","executionTime":39,"executionStatus":"58","error":"59"},{"parameters":"60","type":"33","typeVersion":4.4,"position":"61","id":"35","name":"7"},{"main":"62"},{"main":"56"},"Schedule Trigger","n8n-nodes-base.scheduleTrigger","workflow",{"x-api-key":"63","accept":"64"},"GET","http://app:3000/api/content/scheduled","","none","keypair",{"parameters":"65"},{},[],[],"success",{"main":"66"},["67"],[],"error",{"level":"14","tags":"15","description":"16","timestamp":1782905438111,"context":"17","functionality":"18","name":"19","node":"20","messages":"21","httpCode":"22","message":"23","stack":"24"},{"curlImport":"47","method":"45","url":"46","authentication":"48","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"49","headerParameters":"68","sendBody":false,"options":"69","infoMessage":"47"},[256,0],["70"],"**hidden**","application/json,text/html,application/xhtml+xml,application/xml,text/*;q=0.9, image/*;q=0.8, */*;q=0.7",["71"],["72"],{"previousNode":"41","previousNodeOutput":0,"previousNodeRun":0},{"parameters":"73"},{},["74"],{"name":"75","value":"76"},["77"],["78"],{"json":"79","pairedItem":"80"},"x-api-key","dev-n8n-api-key-change-in-production",{"json":"79","pairedItem":"81"},{"name":"75","value":"76"},{"timestamp":"82","Readable date":"83","Readable time":"84","Day of week":"85","Year":"86","Month":"87","Day of month":"88","Hour":"89","Minute":"90","Second":"91","Timezone":"92"},{"item":0},{"item":0},"2026-07-01T18:30:38.047+07:00","July 1st 2026, 6:30:38 pm","6:30:38 pm","Wednesday","2026","July","01","18","30","38","Asia/Bangkok (UTC+07:00)"]	958f9d58-aa29-4953-914f-a5f61de89b26
25	{"id":"Si28JZdUotdLzill","name":"content post","nodes":[{"parameters":{"notice":"","rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"curlImport":"","method":"GET","url":"http://app:3000/api/content/scheduled","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":false,"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"fieldToSplitOut":"items","include":"noOtherFields","options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"},{"parameters":{"curlImport":"","method":"PATCH","url":"=\\t http://app:3000/api/content/{{ $json.id }}","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":true,"contentType":"json","specifyBody":"keypair","bodyParameters":{"parameters":[{"name":"status","value":"posted"}]},"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[672,0],"id":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","name":"HTTP Request1"}],"connections":{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]},"Split Out":{"main":[[{"node":"HTTP Request1","type":"main","index":0}]]}},"settings":{"executionOrder":"v1","binaryMode":"separate","availableInMCP":false}}	[{"version":1,"startData":"1","resultData":"2","executionData":"3","resumeToken":"4"},{},{"error":"5","runData":"6","lastNodeExecuted":"7"},{"contextData":"8","nodeExecutionStack":"9","metadata":"10","waitingExecution":"11","waitingExecutionSource":"12","runtimeData":"13"},"052d0d7e05958a2d25c48f1b7f0ff727a75df85bc47b30dbf02570c9969eb391",{"level":"14","tags":"15","description":"16","timestamp":1782906338140,"context":"17","functionality":"18","name":"19","node":"20","messages":"21","httpCode":"22","message":"23","stack":"24"},{"Schedule Trigger":"25","HTTP Request":"26"},"HTTP Request",{},["27"],{},{},{},{"version":1,"establishedAt":1782906338055,"source":"28","triggerNode":"29","redaction":"30"},"warning",{},"500 - \\"\\"",{"itemIndex":0,"request":"31"},"regular","NodeApiError",{"parameters":"32","type":"33","typeVersion":4.4,"position":"34","id":"35","name":"7"},["16"],"500","The service was not able to process your request","NodeApiError: The service was not able to process your request\\n    at ExecuteContext.execute (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-nodes-base@file+packages+nodes-base_@aws-sdk+credential-providers@3.808.0_asn1.js@5_8da18263ca0574b0db58d4fefd8173ce/node_modules/n8n-nodes-base/nodes/HttpRequest/V3/HttpRequestV3.node.ts:869:16)\\n    at processTicksAndRejections (node:internal/process/task_queues:104:5)\\n    at WorkflowExecute.executeNode (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1067:8)\\n    at WorkflowExecute.runNode (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1367:11)\\n    at /usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1829:27\\n    at /usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:2521:11",["36"],["37"],{"node":"38","data":"39","source":"40"},"trigger",{"name":"41","type":"42"},{"version":2,"production":false,"manual":false,"source":"43"},{"headers":"44","method":"45","uri":"46","gzip":true,"rejectUnauthorized":true,"followRedirect":true,"resolveWithFullResponse":true,"sendCredentialsOnCrossOriginRedirect":false,"followAllRedirects":true,"timeout":300000,"encoding":null,"json":false,"useStream":true},{"curlImport":"47","method":"45","url":"46","authentication":"48","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"49","headerParameters":"50","sendBody":false,"options":"51","infoMessage":"47"},"n8n-nodes-base.httpRequest",[256,0],"c38b27ff-6b94-479f-be61-d469406da108",{"startTime":1782906338083,"executionIndex":0,"source":"52","hints":"53","executionTime":0,"executionStatus":"54","data":"55"},{"startTime":1782906338083,"executionIndex":1,"source":"56","hints":"57","executionTime":58,"executionStatus":"58","error":"59"},{"parameters":"60","type":"33","typeVersion":4.4,"position":"61","id":"35","name":"7"},{"main":"62"},{"main":"56"},"Schedule Trigger","n8n-nodes-base.scheduleTrigger","workflow",{"x-api-key":"63","accept":"64"},"GET","http://app:3000/api/content/scheduled","","none","keypair",{"parameters":"65"},{},[],[],"success",{"main":"66"},["67"],[],"error",{"level":"14","tags":"15","description":"16","timestamp":1782906338140,"context":"17","functionality":"18","name":"19","node":"20","messages":"21","httpCode":"22","message":"23","stack":"24"},{"curlImport":"47","method":"45","url":"46","authentication":"48","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"49","headerParameters":"68","sendBody":false,"options":"69","infoMessage":"47"},[256,0],["70"],"**hidden**","application/json,text/html,application/xhtml+xml,application/xml,text/*;q=0.9, image/*;q=0.8, */*;q=0.7",["71"],["72"],{"previousNode":"41","previousNodeOutput":0,"previousNodeRun":0},{"parameters":"73"},{},["74"],{"name":"75","value":"76"},["77"],["78"],{"json":"79","pairedItem":"80"},"x-api-key","dev-n8n-api-key-change-in-production",{"json":"79","pairedItem":"81"},{"name":"75","value":"76"},{"timestamp":"82","Readable date":"83","Readable time":"84","Day of week":"85","Year":"86","Month":"87","Day of month":"88","Hour":"89","Minute":"90","Second":"91","Timezone":"92"},{"item":0},{"item":0},"2026-07-01T18:45:38.049+07:00","July 1st 2026, 6:45:38 pm","6:45:38 pm","Wednesday","2026","July","01","18","45","38","Asia/Bangkok (UTC+07:00)"]	958f9d58-aa29-4953-914f-a5f61de89b26
26	{"id":"Si28JZdUotdLzill","name":"content post","nodes":[{"parameters":{"notice":"","rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"curlImport":"","method":"GET","url":"http://app:3000/api/content/scheduled","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":false,"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"fieldToSplitOut":"items","include":"noOtherFields","options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"},{"parameters":{"curlImport":"","method":"PATCH","url":"=\\t http://app:3000/api/content/{{ $json.id }}","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":true,"contentType":"json","specifyBody":"keypair","bodyParameters":{"parameters":[{"name":"status","value":"posted"}]},"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[672,0],"id":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","name":"HTTP Request1"}],"connections":{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]},"Split Out":{"main":[[{"node":"HTTP Request1","type":"main","index":0}]]}},"settings":{"executionOrder":"v1","binaryMode":"separate","availableInMCP":false}}	[{"version":1,"startData":"1","resultData":"2","executionData":"3","resumeToken":"4"},{},{"error":"5","runData":"6","lastNodeExecuted":"7"},{"contextData":"8","nodeExecutionStack":"9","metadata":"10","waitingExecution":"11","waitingExecutionSource":"12","runtimeData":"13"},"bcd8b3daa0a91f9728027e09afd5dd117eee31d84bfa7ffbd4425c59c5fa6131",{"level":"14","tags":"15","description":"16","timestamp":1782907238128,"context":"17","functionality":"18","name":"19","node":"20","messages":"21","httpCode":"22","message":"23","stack":"24"},{"Schedule Trigger":"25","HTTP Request":"26"},"HTTP Request",{},["27"],{},{},{},{"version":1,"establishedAt":1782907238030,"source":"28","triggerNode":"29","redaction":"30"},"warning",{},"500 - \\"\\"",{"itemIndex":0,"request":"31"},"regular","NodeApiError",{"parameters":"32","type":"33","typeVersion":4.4,"position":"34","id":"35","name":"7"},["16"],"500","The service was not able to process your request","NodeApiError: The service was not able to process your request\\n    at ExecuteContext.execute (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-nodes-base@file+packages+nodes-base_@aws-sdk+credential-providers@3.808.0_asn1.js@5_8da18263ca0574b0db58d4fefd8173ce/node_modules/n8n-nodes-base/nodes/HttpRequest/V3/HttpRequestV3.node.ts:869:16)\\n    at processTicksAndRejections (node:internal/process/task_queues:104:5)\\n    at WorkflowExecute.executeNode (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1067:8)\\n    at WorkflowExecute.runNode (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1367:11)\\n    at /usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1829:27\\n    at /usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:2521:11",["36"],["37"],{"node":"38","data":"39","source":"40"},"trigger",{"name":"41","type":"42"},{"version":2,"production":false,"manual":false,"source":"43"},{"headers":"44","method":"45","uri":"46","gzip":true,"rejectUnauthorized":true,"followRedirect":true,"resolveWithFullResponse":true,"sendCredentialsOnCrossOriginRedirect":false,"followAllRedirects":true,"timeout":300000,"encoding":null,"json":false,"useStream":true},{"curlImport":"47","method":"45","url":"46","authentication":"48","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"49","headerParameters":"50","sendBody":false,"options":"51","infoMessage":"47"},"n8n-nodes-base.httpRequest",[256,0],"c38b27ff-6b94-479f-be61-d469406da108",{"startTime":1782907238060,"executionIndex":0,"source":"52","hints":"53","executionTime":0,"executionStatus":"54","data":"55"},{"startTime":1782907238060,"executionIndex":1,"source":"56","hints":"57","executionTime":68,"executionStatus":"58","error":"59"},{"parameters":"60","type":"33","typeVersion":4.4,"position":"61","id":"35","name":"7"},{"main":"62"},{"main":"56"},"Schedule Trigger","n8n-nodes-base.scheduleTrigger","workflow",{"x-api-key":"63","accept":"64"},"GET","http://app:3000/api/content/scheduled","","none","keypair",{"parameters":"65"},{},[],[],"success",{"main":"66"},["67"],[],"error",{"level":"14","tags":"15","description":"16","timestamp":1782907238128,"context":"17","functionality":"18","name":"19","node":"20","messages":"21","httpCode":"22","message":"23","stack":"24"},{"curlImport":"47","method":"45","url":"46","authentication":"48","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"49","headerParameters":"68","sendBody":false,"options":"69","infoMessage":"47"},[256,0],["70"],"**hidden**","application/json,text/html,application/xhtml+xml,application/xml,text/*;q=0.9, image/*;q=0.8, */*;q=0.7",["71"],["72"],{"previousNode":"41","previousNodeOutput":0,"previousNodeRun":0},{"parameters":"73"},{},["74"],{"name":"75","value":"76"},["77"],["78"],{"json":"79","pairedItem":"80"},"x-api-key","dev-n8n-api-key-change-in-production",{"json":"79","pairedItem":"81"},{"name":"75","value":"76"},{"timestamp":"82","Readable date":"83","Readable time":"84","Day of week":"85","Year":"86","Month":"87","Day of month":"88","Hour":"89","Minute":"90","Second":"91","Timezone":"92"},{"item":0},{"item":0},"2026-07-01T19:00:38.027+07:00","July 1st 2026, 7:00:38 pm","7:00:38 pm","Wednesday","2026","July","01","19","00","38","Asia/Bangkok (UTC+07:00)"]	958f9d58-aa29-4953-914f-a5f61de89b26
27	{"id":"Si28JZdUotdLzill","name":"content post","nodes":[{"parameters":{"notice":"","rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"curlImport":"","method":"GET","url":"http://app:3000/api/content/scheduled","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":false,"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"fieldToSplitOut":"items","include":"noOtherFields","options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"},{"parameters":{"curlImport":"","method":"PATCH","url":"=\\t http://app:3000/api/content/{{ $json.id }}","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":true,"contentType":"json","specifyBody":"keypair","bodyParameters":{"parameters":[{"name":"status","value":"posted"}]},"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[672,0],"id":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","name":"HTTP Request1"}],"connections":{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]},"Split Out":{"main":[[{"node":"HTTP Request1","type":"main","index":0}]]}},"settings":{"executionOrder":"v1","binaryMode":"separate","availableInMCP":false}}	[{"version":1,"startData":"1","resultData":"2","executionData":"3","resumeToken":"4"},{},{"error":"5","runData":"6","lastNodeExecuted":"7"},{"contextData":"8","nodeExecutionStack":"9","metadata":"10","waitingExecution":"11","waitingExecutionSource":"12","runtimeData":"13"},"eafffc75b0295fb19c1c485557e58330961693231b77df07375064dcfec3ebe6",{"level":"14","tags":"15","description":"16","timestamp":1782908138133,"context":"17","functionality":"18","name":"19","node":"20","messages":"21","httpCode":"22","message":"23","stack":"24"},{"Schedule Trigger":"25","HTTP Request":"26"},"HTTP Request",{},["27"],{},{},{},{"version":1,"establishedAt":1782908138031,"source":"28","triggerNode":"29","redaction":"30"},"warning",{},"500 - \\"\\"",{"itemIndex":0,"request":"31"},"regular","NodeApiError",{"parameters":"32","type":"33","typeVersion":4.4,"position":"34","id":"35","name":"7"},["16"],"500","The service was not able to process your request","NodeApiError: The service was not able to process your request\\n    at ExecuteContext.execute (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-nodes-base@file+packages+nodes-base_@aws-sdk+credential-providers@3.808.0_asn1.js@5_8da18263ca0574b0db58d4fefd8173ce/node_modules/n8n-nodes-base/nodes/HttpRequest/V3/HttpRequestV3.node.ts:869:16)\\n    at processTicksAndRejections (node:internal/process/task_queues:104:5)\\n    at WorkflowExecute.executeNode (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1067:8)\\n    at WorkflowExecute.runNode (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1367:11)\\n    at /usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1829:27\\n    at /usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:2521:11",["36"],["37"],{"node":"38","data":"39","source":"40"},"trigger",{"name":"41","type":"42"},{"version":2,"production":false,"manual":false,"source":"43"},{"headers":"44","method":"45","uri":"46","gzip":true,"rejectUnauthorized":true,"followRedirect":true,"resolveWithFullResponse":true,"sendCredentialsOnCrossOriginRedirect":false,"followAllRedirects":true,"timeout":300000,"encoding":null,"json":false,"useStream":true},{"curlImport":"47","method":"45","url":"46","authentication":"48","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"49","headerParameters":"50","sendBody":false,"options":"51","infoMessage":"47"},"n8n-nodes-base.httpRequest",[256,0],"c38b27ff-6b94-479f-be61-d469406da108",{"startTime":1782908138059,"executionIndex":0,"source":"52","hints":"53","executionTime":0,"executionStatus":"54","data":"55"},{"startTime":1782908138059,"executionIndex":1,"source":"56","hints":"57","executionTime":75,"executionStatus":"58","error":"59"},{"parameters":"60","type":"33","typeVersion":4.4,"position":"61","id":"35","name":"7"},{"main":"62"},{"main":"56"},"Schedule Trigger","n8n-nodes-base.scheduleTrigger","workflow",{"x-api-key":"63","accept":"64"},"GET","http://app:3000/api/content/scheduled","","none","keypair",{"parameters":"65"},{},[],[],"success",{"main":"66"},["67"],[],"error",{"level":"14","tags":"15","description":"16","timestamp":1782908138133,"context":"17","functionality":"18","name":"19","node":"20","messages":"21","httpCode":"22","message":"23","stack":"24"},{"curlImport":"47","method":"45","url":"46","authentication":"48","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"49","headerParameters":"68","sendBody":false,"options":"69","infoMessage":"47"},[256,0],["70"],"**hidden**","application/json,text/html,application/xhtml+xml,application/xml,text/*;q=0.9, image/*;q=0.8, */*;q=0.7",["71"],["72"],{"previousNode":"41","previousNodeOutput":0,"previousNodeRun":0},{"parameters":"73"},{},["74"],{"name":"75","value":"76"},["77"],["78"],{"json":"79","pairedItem":"80"},"x-api-key","dev-n8n-api-key-change-in-production",{"json":"79","pairedItem":"81"},{"name":"75","value":"76"},{"timestamp":"82","Readable date":"83","Readable time":"84","Day of week":"85","Year":"86","Month":"87","Day of month":"88","Hour":"89","Minute":"90","Second":"91","Timezone":"92"},{"item":0},{"item":0},"2026-07-01T19:15:38.029+07:00","July 1st 2026, 7:15:38 pm","7:15:38 pm","Wednesday","2026","July","01","19","15","38","Asia/Bangkok (UTC+07:00)"]	958f9d58-aa29-4953-914f-a5f61de89b26
28	{"id":"Si28JZdUotdLzill","name":"content post","nodes":[{"parameters":{"notice":"","rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"curlImport":"","method":"GET","url":"http://app:3000/api/content/scheduled","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":false,"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"fieldToSplitOut":"items","include":"noOtherFields","options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"},{"parameters":{"curlImport":"","method":"PATCH","url":"=\\t http://app:3000/api/content/{{ $json.id }}","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":true,"contentType":"json","specifyBody":"keypair","bodyParameters":{"parameters":[{"name":"status","value":"posted"}]},"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[672,0],"id":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","name":"HTTP Request1"}],"connections":{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]},"Split Out":{"main":[[{"node":"HTTP Request1","type":"main","index":0}]]}},"settings":{"executionOrder":"v1","binaryMode":"separate","availableInMCP":false}}	[{"version":1,"startData":"1","resultData":"2","executionData":"3","resumeToken":"4"},{},{"error":"5","runData":"6","lastNodeExecuted":"7"},{"contextData":"8","nodeExecutionStack":"9","metadata":"10","waitingExecution":"11","waitingExecutionSource":"12","runtimeData":"13"},"248370e84de3bce8359c552d7fee4f7653fb78439f5a1d88fcf8ef0ec070c6af",{"level":"14","tags":"15","description":"16","timestamp":1782909038135,"context":"17","functionality":"18","name":"19","node":"20","messages":"21","httpCode":"22","message":"23","stack":"24"},{"Schedule Trigger":"25","HTTP Request":"26"},"HTTP Request",{},["27"],{},{},{},{"version":1,"establishedAt":1782909038050,"source":"28","triggerNode":"29","redaction":"30"},"warning",{},"500 - \\"\\"",{"itemIndex":0,"request":"31"},"regular","NodeApiError",{"parameters":"32","type":"33","typeVersion":4.4,"position":"34","id":"35","name":"7"},["16"],"500","The service was not able to process your request","NodeApiError: The service was not able to process your request\\n    at ExecuteContext.execute (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-nodes-base@file+packages+nodes-base_@aws-sdk+credential-providers@3.808.0_asn1.js@5_8da18263ca0574b0db58d4fefd8173ce/node_modules/n8n-nodes-base/nodes/HttpRequest/V3/HttpRequestV3.node.ts:869:16)\\n    at processTicksAndRejections (node:internal/process/task_queues:104:5)\\n    at WorkflowExecute.executeNode (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1067:8)\\n    at WorkflowExecute.runNode (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1367:11)\\n    at /usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1829:27\\n    at /usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:2521:11",["36"],["37"],{"node":"38","data":"39","source":"40"},"trigger",{"name":"41","type":"42"},{"version":2,"production":false,"manual":false,"source":"43"},{"headers":"44","method":"45","uri":"46","gzip":true,"rejectUnauthorized":true,"followRedirect":true,"resolveWithFullResponse":true,"sendCredentialsOnCrossOriginRedirect":false,"followAllRedirects":true,"timeout":300000,"encoding":null,"json":false,"useStream":true},{"curlImport":"47","method":"45","url":"46","authentication":"48","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"49","headerParameters":"50","sendBody":false,"options":"51","infoMessage":"47"},"n8n-nodes-base.httpRequest",[256,0],"c38b27ff-6b94-479f-be61-d469406da108",{"startTime":1782909038089,"executionIndex":0,"source":"52","hints":"53","executionTime":0,"executionStatus":"54","data":"55"},{"startTime":1782909038089,"executionIndex":1,"source":"56","hints":"57","executionTime":46,"executionStatus":"58","error":"59"},{"parameters":"60","type":"33","typeVersion":4.4,"position":"61","id":"35","name":"7"},{"main":"62"},{"main":"56"},"Schedule Trigger","n8n-nodes-base.scheduleTrigger","workflow",{"x-api-key":"63","accept":"64"},"GET","http://app:3000/api/content/scheduled","","none","keypair",{"parameters":"65"},{},[],[],"success",{"main":"66"},["67"],[],"error",{"level":"14","tags":"15","description":"16","timestamp":1782909038135,"context":"17","functionality":"18","name":"19","node":"20","messages":"21","httpCode":"22","message":"23","stack":"24"},{"curlImport":"47","method":"45","url":"46","authentication":"48","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"49","headerParameters":"68","sendBody":false,"options":"69","infoMessage":"47"},[256,0],["70"],"**hidden**","application/json,text/html,application/xhtml+xml,application/xml,text/*;q=0.9, image/*;q=0.8, */*;q=0.7",["71"],["72"],{"previousNode":"41","previousNodeOutput":0,"previousNodeRun":0},{"parameters":"73"},{},["74"],{"name":"75","value":"76"},["77"],["78"],{"json":"79","pairedItem":"80"},"x-api-key","dev-n8n-api-key-change-in-production",{"json":"79","pairedItem":"81"},{"name":"75","value":"76"},{"timestamp":"82","Readable date":"83","Readable time":"84","Day of week":"85","Year":"86","Month":"87","Day of month":"88","Hour":"89","Minute":"90","Second":"91","Timezone":"92"},{"item":0},{"item":0},"2026-07-01T19:30:38.046+07:00","July 1st 2026, 7:30:38 pm","7:30:38 pm","Wednesday","2026","July","01","19","30","38","Asia/Bangkok (UTC+07:00)"]	958f9d58-aa29-4953-914f-a5f61de89b26
29	{"id":"Si28JZdUotdLzill","name":"content post","nodes":[{"parameters":{"notice":"","rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"curlImport":"","method":"GET","url":"http://app:3000/api/content/scheduled","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":false,"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"fieldToSplitOut":"items","include":"noOtherFields","options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"},{"parameters":{"curlImport":"","method":"PATCH","url":"=\\t http://app:3000/api/content/{{ $json.id }}","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":true,"contentType":"json","specifyBody":"keypair","bodyParameters":{"parameters":[{"name":"status","value":"posted"}]},"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[672,0],"id":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","name":"HTTP Request1"}],"connections":{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]},"Split Out":{"main":[[{"node":"HTTP Request1","type":"main","index":0}]]}},"settings":{"executionOrder":"v1","binaryMode":"separate","availableInMCP":false}}	[{"version":1,"startData":"1","resultData":"2","executionData":"3","resumeToken":"4"},{},{"error":"5","runData":"6","lastNodeExecuted":"7"},{"contextData":"8","nodeExecutionStack":"9","metadata":"10","waitingExecution":"11","waitingExecutionSource":"12","runtimeData":"13"},"cfdeaf05a7cbd98bb0adfcb7fff085704de8a424d7bc2fde8c9c53a2ebb39937",{"level":"14","tags":"15","description":"16","timestamp":1782909938105,"context":"17","functionality":"18","name":"19","node":"20","messages":"21","httpCode":"22","message":"23","stack":"24"},{"Schedule Trigger":"25","HTTP Request":"26"},"HTTP Request",{},["27"],{},{},{},{"version":1,"establishedAt":1782909938047,"source":"28","triggerNode":"29","redaction":"30"},"warning",{},"500 - \\"\\"",{"itemIndex":0,"request":"31"},"regular","NodeApiError",{"parameters":"32","type":"33","typeVersion":4.4,"position":"34","id":"35","name":"7"},["16"],"500","The service was not able to process your request","NodeApiError: The service was not able to process your request\\n    at ExecuteContext.execute (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-nodes-base@file+packages+nodes-base_@aws-sdk+credential-providers@3.808.0_asn1.js@5_8da18263ca0574b0db58d4fefd8173ce/node_modules/n8n-nodes-base/nodes/HttpRequest/V3/HttpRequestV3.node.ts:869:16)\\n    at processTicksAndRejections (node:internal/process/task_queues:104:5)\\n    at WorkflowExecute.executeNode (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1067:8)\\n    at WorkflowExecute.runNode (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1367:11)\\n    at /usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1829:27\\n    at /usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:2521:11",["36"],["37"],{"node":"38","data":"39","source":"40"},"trigger",{"name":"41","type":"42"},{"version":2,"production":false,"manual":false,"source":"43"},{"headers":"44","method":"45","uri":"46","gzip":true,"rejectUnauthorized":true,"followRedirect":true,"resolveWithFullResponse":true,"sendCredentialsOnCrossOriginRedirect":false,"followAllRedirects":true,"timeout":300000,"encoding":null,"json":false,"useStream":true},{"curlImport":"47","method":"45","url":"46","authentication":"48","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"49","headerParameters":"50","sendBody":false,"options":"51","infoMessage":"47"},"n8n-nodes-base.httpRequest",[256,0],"c38b27ff-6b94-479f-be61-d469406da108",{"startTime":1782909938069,"executionIndex":0,"source":"52","hints":"53","executionTime":0,"executionStatus":"54","data":"55"},{"startTime":1782909938069,"executionIndex":1,"source":"56","hints":"57","executionTime":36,"executionStatus":"58","error":"59"},{"parameters":"60","type":"33","typeVersion":4.4,"position":"61","id":"35","name":"7"},{"main":"62"},{"main":"56"},"Schedule Trigger","n8n-nodes-base.scheduleTrigger","workflow",{"x-api-key":"63","accept":"64"},"GET","http://app:3000/api/content/scheduled","","none","keypair",{"parameters":"65"},{},[],[],"success",{"main":"66"},["67"],[],"error",{"level":"14","tags":"15","description":"16","timestamp":1782909938105,"context":"17","functionality":"18","name":"19","node":"20","messages":"21","httpCode":"22","message":"23","stack":"24"},{"curlImport":"47","method":"45","url":"46","authentication":"48","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"49","headerParameters":"68","sendBody":false,"options":"69","infoMessage":"47"},[256,0],["70"],"**hidden**","application/json,text/html,application/xhtml+xml,application/xml,text/*;q=0.9, image/*;q=0.8, */*;q=0.7",["71"],["72"],{"previousNode":"41","previousNodeOutput":0,"previousNodeRun":0},{"parameters":"73"},{},["74"],{"name":"75","value":"76"},["77"],["78"],{"json":"79","pairedItem":"80"},"x-api-key","dev-n8n-api-key-change-in-production",{"json":"79","pairedItem":"81"},{"name":"75","value":"76"},{"timestamp":"82","Readable date":"83","Readable time":"84","Day of week":"85","Year":"86","Month":"87","Day of month":"88","Hour":"89","Minute":"90","Second":"91","Timezone":"92"},{"item":0},{"item":0},"2026-07-01T19:45:38.045+07:00","July 1st 2026, 7:45:38 pm","7:45:38 pm","Wednesday","2026","July","01","19","45","38","Asia/Bangkok (UTC+07:00)"]	958f9d58-aa29-4953-914f-a5f61de89b26
30	{"id":"Si28JZdUotdLzill","name":"content post","nodes":[{"parameters":{"notice":"","rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"curlImport":"","method":"GET","url":"http://app:3000/api/content/scheduled","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":false,"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"fieldToSplitOut":"items","include":"noOtherFields","options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"},{"parameters":{"curlImport":"","method":"PATCH","url":"=\\t http://app:3000/api/content/{{ $json.id }}","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":true,"contentType":"json","specifyBody":"keypair","bodyParameters":{"parameters":[{"name":"status","value":"posted"}]},"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[672,0],"id":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","name":"HTTP Request1"}],"connections":{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]},"Split Out":{"main":[[{"node":"HTTP Request1","type":"main","index":0}]]}},"settings":{"executionOrder":"v1","binaryMode":"separate","availableInMCP":false}}	[{"version":1,"startData":"1","resultData":"2","executionData":"3","resumeToken":"4"},{},{"error":"5","runData":"6","lastNodeExecuted":"7"},{"contextData":"8","nodeExecutionStack":"9","metadata":"10","waitingExecution":"11","waitingExecutionSource":"12","runtimeData":"13"},"d7dbf6f2745c4afeecbf1f0b1ad53eb12e216b6f92910ae64099302e13f75dc3",{"level":"14","tags":"15","description":"16","timestamp":1782910838128,"context":"17","functionality":"18","name":"19","node":"20","messages":"21","httpCode":"22","message":"23","stack":"24"},{"Schedule Trigger":"25","HTTP Request":"26"},"HTTP Request",{},["27"],{},{},{},{"version":1,"establishedAt":1782910838040,"source":"28","triggerNode":"29","redaction":"30"},"warning",{},"500 - \\"\\"",{"itemIndex":0,"request":"31"},"regular","NodeApiError",{"parameters":"32","type":"33","typeVersion":4.4,"position":"34","id":"35","name":"7"},["16"],"500","The service was not able to process your request","NodeApiError: The service was not able to process your request\\n    at ExecuteContext.execute (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-nodes-base@file+packages+nodes-base_@aws-sdk+credential-providers@3.808.0_asn1.js@5_8da18263ca0574b0db58d4fefd8173ce/node_modules/n8n-nodes-base/nodes/HttpRequest/V3/HttpRequestV3.node.ts:869:16)\\n    at processTicksAndRejections (node:internal/process/task_queues:104:5)\\n    at WorkflowExecute.executeNode (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1067:8)\\n    at WorkflowExecute.runNode (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1367:11)\\n    at /usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1829:27\\n    at /usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:2521:11",["36"],["37"],{"node":"38","data":"39","source":"40"},"trigger",{"name":"41","type":"42"},{"version":2,"production":false,"manual":false,"source":"43"},{"headers":"44","method":"45","uri":"46","gzip":true,"rejectUnauthorized":true,"followRedirect":true,"resolveWithFullResponse":true,"sendCredentialsOnCrossOriginRedirect":false,"followAllRedirects":true,"timeout":300000,"encoding":null,"json":false,"useStream":true},{"curlImport":"47","method":"45","url":"46","authentication":"48","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"49","headerParameters":"50","sendBody":false,"options":"51","infoMessage":"47"},"n8n-nodes-base.httpRequest",[256,0],"c38b27ff-6b94-479f-be61-d469406da108",{"startTime":1782910838068,"executionIndex":0,"source":"52","hints":"53","executionTime":0,"executionStatus":"54","data":"55"},{"startTime":1782910838068,"executionIndex":1,"source":"56","hints":"57","executionTime":61,"executionStatus":"58","error":"59"},{"parameters":"60","type":"33","typeVersion":4.4,"position":"61","id":"35","name":"7"},{"main":"62"},{"main":"56"},"Schedule Trigger","n8n-nodes-base.scheduleTrigger","workflow",{"x-api-key":"63","accept":"64"},"GET","http://app:3000/api/content/scheduled","","none","keypair",{"parameters":"65"},{},[],[],"success",{"main":"66"},["67"],[],"error",{"level":"14","tags":"15","description":"16","timestamp":1782910838128,"context":"17","functionality":"18","name":"19","node":"20","messages":"21","httpCode":"22","message":"23","stack":"24"},{"curlImport":"47","method":"45","url":"46","authentication":"48","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"49","headerParameters":"68","sendBody":false,"options":"69","infoMessage":"47"},[256,0],["70"],"**hidden**","application/json,text/html,application/xhtml+xml,application/xml,text/*;q=0.9, image/*;q=0.8, */*;q=0.7",["71"],["72"],{"previousNode":"41","previousNodeOutput":0,"previousNodeRun":0},{"parameters":"73"},{},["74"],{"name":"75","value":"76"},["77"],["78"],{"json":"79","pairedItem":"80"},"x-api-key","dev-n8n-api-key-change-in-production",{"json":"79","pairedItem":"81"},{"name":"75","value":"76"},{"timestamp":"82","Readable date":"83","Readable time":"84","Day of week":"85","Year":"86","Month":"87","Day of month":"88","Hour":"89","Minute":"90","Second":"91","Timezone":"92"},{"item":0},{"item":0},"2026-07-01T20:00:38.035+07:00","July 1st 2026, 8:00:38 pm","8:00:38 pm","Wednesday","2026","July","01","20","00","38","Asia/Bangkok (UTC+07:00)"]	958f9d58-aa29-4953-914f-a5f61de89b26
31	{"id":"Si28JZdUotdLzill","name":"content post","nodes":[{"parameters":{"notice":"","rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"curlImport":"","method":"GET","url":"http://app:3000/api/content/scheduled","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":false,"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"fieldToSplitOut":"items","include":"noOtherFields","options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"},{"parameters":{"curlImport":"","method":"PATCH","url":"=\\t http://app:3000/api/content/{{ $json.id }}","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":true,"contentType":"json","specifyBody":"keypair","bodyParameters":{"parameters":[{"name":"status","value":"posted"}]},"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[672,0],"id":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","name":"HTTP Request1"}],"connections":{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]},"Split Out":{"main":[[{"node":"HTTP Request1","type":"main","index":0}]]}},"settings":{"executionOrder":"v1","binaryMode":"separate","availableInMCP":false}}	[{"version":1,"startData":"1","resultData":"2","executionData":"3","resumeToken":"4"},{},{"error":"5","runData":"6","lastNodeExecuted":"7"},{"contextData":"8","nodeExecutionStack":"9","metadata":"10","waitingExecution":"11","waitingExecutionSource":"12","runtimeData":"13"},"a29ce8be70cac382d627e66226b10ceb07b418dc1e804004386d259daad6d3da",{"level":"14","tags":"15","description":"16","timestamp":1782911738121,"context":"17","functionality":"18","name":"19","node":"20","messages":"21","httpCode":"22","message":"23","stack":"24"},{"Schedule Trigger":"25","HTTP Request":"26"},"HTTP Request",{},["27"],{},{},{},{"version":1,"establishedAt":1782911738048,"source":"28","triggerNode":"29","redaction":"30"},"warning",{},"500 - \\"\\"",{"itemIndex":0,"request":"31"},"regular","NodeApiError",{"parameters":"32","type":"33","typeVersion":4.4,"position":"34","id":"35","name":"7"},["16"],"500","The service was not able to process your request","NodeApiError: The service was not able to process your request\\n    at ExecuteContext.execute (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-nodes-base@file+packages+nodes-base_@aws-sdk+credential-providers@3.808.0_asn1.js@5_8da18263ca0574b0db58d4fefd8173ce/node_modules/n8n-nodes-base/nodes/HttpRequest/V3/HttpRequestV3.node.ts:869:16)\\n    at processTicksAndRejections (node:internal/process/task_queues:104:5)\\n    at WorkflowExecute.executeNode (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1067:8)\\n    at WorkflowExecute.runNode (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1367:11)\\n    at /usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1829:27\\n    at /usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:2521:11",["36"],["37"],{"node":"38","data":"39","source":"40"},"trigger",{"name":"41","type":"42"},{"version":2,"production":false,"manual":false,"source":"43"},{"headers":"44","method":"45","uri":"46","gzip":true,"rejectUnauthorized":true,"followRedirect":true,"resolveWithFullResponse":true,"sendCredentialsOnCrossOriginRedirect":false,"followAllRedirects":true,"timeout":300000,"encoding":null,"json":false,"useStream":true},{"curlImport":"47","method":"45","url":"46","authentication":"48","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"49","headerParameters":"50","sendBody":false,"options":"51","infoMessage":"47"},"n8n-nodes-base.httpRequest",[256,0],"c38b27ff-6b94-479f-be61-d469406da108",{"startTime":1782911738072,"executionIndex":0,"source":"52","hints":"53","executionTime":0,"executionStatus":"54","data":"55"},{"startTime":1782911738073,"executionIndex":1,"source":"56","hints":"57","executionTime":48,"executionStatus":"58","error":"59"},{"parameters":"60","type":"33","typeVersion":4.4,"position":"61","id":"35","name":"7"},{"main":"62"},{"main":"56"},"Schedule Trigger","n8n-nodes-base.scheduleTrigger","workflow",{"x-api-key":"63","accept":"64"},"GET","http://app:3000/api/content/scheduled","","none","keypair",{"parameters":"65"},{},[],[],"success",{"main":"66"},["67"],[],"error",{"level":"14","tags":"15","description":"16","timestamp":1782911738121,"context":"17","functionality":"18","name":"19","node":"20","messages":"21","httpCode":"22","message":"23","stack":"24"},{"curlImport":"47","method":"45","url":"46","authentication":"48","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"49","headerParameters":"68","sendBody":false,"options":"69","infoMessage":"47"},[256,0],["70"],"**hidden**","application/json,text/html,application/xhtml+xml,application/xml,text/*;q=0.9, image/*;q=0.8, */*;q=0.7",["71"],["72"],{"previousNode":"41","previousNodeOutput":0,"previousNodeRun":0},{"parameters":"73"},{},["74"],{"name":"75","value":"76"},["77"],["78"],{"json":"79","pairedItem":"80"},"x-api-key","dev-n8n-api-key-change-in-production",{"json":"79","pairedItem":"81"},{"name":"75","value":"76"},{"timestamp":"82","Readable date":"83","Readable time":"84","Day of week":"85","Year":"86","Month":"87","Day of month":"88","Hour":"89","Minute":"90","Second":"91","Timezone":"92"},{"item":0},{"item":0},"2026-07-01T20:15:38.044+07:00","July 1st 2026, 8:15:38 pm","8:15:38 pm","Wednesday","2026","July","01","20","15","38","Asia/Bangkok (UTC+07:00)"]	958f9d58-aa29-4953-914f-a5f61de89b26
32	{"id":"Si28JZdUotdLzill","name":"content post","nodes":[{"parameters":{"notice":"","rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"curlImport":"","method":"GET","url":"http://app:3000/api/content/scheduled","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":false,"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"fieldToSplitOut":"items","include":"noOtherFields","options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"},{"parameters":{"curlImport":"","method":"PATCH","url":"=\\t http://app:3000/api/content/{{ $json.id }}","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":true,"contentType":"json","specifyBody":"keypair","bodyParameters":{"parameters":[{"name":"status","value":"posted"}]},"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[672,0],"id":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","name":"HTTP Request1"}],"connections":{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]},"Split Out":{"main":[[{"node":"HTTP Request1","type":"main","index":0}]]}},"settings":{"executionOrder":"v1","binaryMode":"separate","availableInMCP":false}}	[{"version":1,"startData":"1","resultData":"2","executionData":"3","resumeToken":"4"},{},{"error":"5","runData":"6","lastNodeExecuted":"7"},{"contextData":"8","nodeExecutionStack":"9","metadata":"10","waitingExecution":"11","waitingExecutionSource":"12","runtimeData":"13"},"f375b61a366658e62156e3bba02a8877d202d48630f9c607f5b57a8c1d63cdbd",{"level":"14","tags":"15","description":"16","timestamp":1782912638131,"context":"17","functionality":"18","name":"19","node":"20","messages":"21","httpCode":"22","message":"23","stack":"24"},{"Schedule Trigger":"25","HTTP Request":"26"},"HTTP Request",{},["27"],{},{},{},{"version":1,"establishedAt":1782912638029,"source":"28","triggerNode":"29","redaction":"30"},"warning",{},"500 - \\"\\"",{"itemIndex":0,"request":"31"},"regular","NodeApiError",{"parameters":"32","type":"33","typeVersion":4.4,"position":"34","id":"35","name":"7"},["16"],"500","The service was not able to process your request","NodeApiError: The service was not able to process your request\\n    at ExecuteContext.execute (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-nodes-base@file+packages+nodes-base_@aws-sdk+credential-providers@3.808.0_asn1.js@5_8da18263ca0574b0db58d4fefd8173ce/node_modules/n8n-nodes-base/nodes/HttpRequest/V3/HttpRequestV3.node.ts:869:16)\\n    at processTicksAndRejections (node:internal/process/task_queues:104:5)\\n    at WorkflowExecute.executeNode (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1067:8)\\n    at WorkflowExecute.runNode (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1367:11)\\n    at /usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1829:27\\n    at /usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:2521:11",["36"],["37"],{"node":"38","data":"39","source":"40"},"trigger",{"name":"41","type":"42"},{"version":2,"production":false,"manual":false,"source":"43"},{"headers":"44","method":"45","uri":"46","gzip":true,"rejectUnauthorized":true,"followRedirect":true,"resolveWithFullResponse":true,"sendCredentialsOnCrossOriginRedirect":false,"followAllRedirects":true,"timeout":300000,"encoding":null,"json":false,"useStream":true},{"curlImport":"47","method":"45","url":"46","authentication":"48","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"49","headerParameters":"50","sendBody":false,"options":"51","infoMessage":"47"},"n8n-nodes-base.httpRequest",[256,0],"c38b27ff-6b94-479f-be61-d469406da108",{"startTime":1782912638058,"executionIndex":0,"source":"52","hints":"53","executionTime":0,"executionStatus":"54","data":"55"},{"startTime":1782912638058,"executionIndex":1,"source":"56","hints":"57","executionTime":73,"executionStatus":"58","error":"59"},{"parameters":"60","type":"33","typeVersion":4.4,"position":"61","id":"35","name":"7"},{"main":"62"},{"main":"56"},"Schedule Trigger","n8n-nodes-base.scheduleTrigger","workflow",{"x-api-key":"63","accept":"64"},"GET","http://app:3000/api/content/scheduled","","none","keypair",{"parameters":"65"},{},[],[],"success",{"main":"66"},["67"],[],"error",{"level":"14","tags":"15","description":"16","timestamp":1782912638131,"context":"17","functionality":"18","name":"19","node":"20","messages":"21","httpCode":"22","message":"23","stack":"24"},{"curlImport":"47","method":"45","url":"46","authentication":"48","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"49","headerParameters":"68","sendBody":false,"options":"69","infoMessage":"47"},[256,0],["70"],"**hidden**","application/json,text/html,application/xhtml+xml,application/xml,text/*;q=0.9, image/*;q=0.8, */*;q=0.7",["71"],["72"],{"previousNode":"41","previousNodeOutput":0,"previousNodeRun":0},{"parameters":"73"},{},["74"],{"name":"75","value":"76"},["77"],["78"],{"json":"79","pairedItem":"80"},"x-api-key","dev-n8n-api-key-change-in-production",{"json":"79","pairedItem":"81"},{"name":"75","value":"76"},{"timestamp":"82","Readable date":"83","Readable time":"84","Day of week":"85","Year":"86","Month":"87","Day of month":"88","Hour":"89","Minute":"90","Second":"91","Timezone":"92"},{"item":0},{"item":0},"2026-07-01T20:30:38.026+07:00","July 1st 2026, 8:30:38 pm","8:30:38 pm","Wednesday","2026","July","01","20","30","38","Asia/Bangkok (UTC+07:00)"]	958f9d58-aa29-4953-914f-a5f61de89b26
33	{"id":"Si28JZdUotdLzill","name":"content post","nodes":[{"parameters":{"notice":"","rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"curlImport":"","method":"GET","url":"http://app:3000/api/content/scheduled","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":false,"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"fieldToSplitOut":"items","include":"noOtherFields","options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"},{"parameters":{"curlImport":"","method":"PATCH","url":"=\\t http://app:3000/api/content/{{ $json.id }}","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":true,"contentType":"json","specifyBody":"keypair","bodyParameters":{"parameters":[{"name":"status","value":"posted"}]},"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[672,0],"id":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","name":"HTTP Request1"}],"connections":{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]},"Split Out":{"main":[[{"node":"HTTP Request1","type":"main","index":0}]]}},"settings":{"executionOrder":"v1","binaryMode":"separate","availableInMCP":false}}	[{"version":1,"startData":"1","resultData":"2","executionData":"3","resumeToken":"4"},{},{"error":"5","runData":"6","lastNodeExecuted":"7"},{"contextData":"8","nodeExecutionStack":"9","metadata":"10","waitingExecution":"11","waitingExecutionSource":"12","runtimeData":"13"},"b9e0eda19ba5472caf87da7985ef5d8caaca8a4c076f94202bd78580e844f149",{"level":"14","tags":"15","description":"16","timestamp":1782913538127,"context":"17","functionality":"18","name":"19","node":"20","messages":"21","httpCode":"22","message":"23","stack":"24"},{"Schedule Trigger":"25","HTTP Request":"26"},"HTTP Request",{},["27"],{},{},{},{"version":1,"establishedAt":1782913538030,"source":"28","triggerNode":"29","redaction":"30"},"warning",{},"500 - \\"\\"",{"itemIndex":0,"request":"31"},"regular","NodeApiError",{"parameters":"32","type":"33","typeVersion":4.4,"position":"34","id":"35","name":"7"},["16"],"500","The service was not able to process your request","NodeApiError: The service was not able to process your request\\n    at ExecuteContext.execute (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-nodes-base@file+packages+nodes-base_@aws-sdk+credential-providers@3.808.0_asn1.js@5_8da18263ca0574b0db58d4fefd8173ce/node_modules/n8n-nodes-base/nodes/HttpRequest/V3/HttpRequestV3.node.ts:869:16)\\n    at processTicksAndRejections (node:internal/process/task_queues:104:5)\\n    at WorkflowExecute.executeNode (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1067:8)\\n    at WorkflowExecute.runNode (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1367:11)\\n    at /usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1829:27\\n    at /usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:2521:11",["36"],["37"],{"node":"38","data":"39","source":"40"},"trigger",{"name":"41","type":"42"},{"version":2,"production":false,"manual":false,"source":"43"},{"headers":"44","method":"45","uri":"46","gzip":true,"rejectUnauthorized":true,"followRedirect":true,"resolveWithFullResponse":true,"sendCredentialsOnCrossOriginRedirect":false,"followAllRedirects":true,"timeout":300000,"encoding":null,"json":false,"useStream":true},{"curlImport":"47","method":"45","url":"46","authentication":"48","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"49","headerParameters":"50","sendBody":false,"options":"51","infoMessage":"47"},"n8n-nodes-base.httpRequest",[256,0],"c38b27ff-6b94-479f-be61-d469406da108",{"startTime":1782913538068,"executionIndex":0,"source":"52","hints":"53","executionTime":1,"executionStatus":"54","data":"55"},{"startTime":1782913538069,"executionIndex":1,"source":"56","hints":"57","executionTime":59,"executionStatus":"58","error":"59"},{"parameters":"60","type":"33","typeVersion":4.4,"position":"61","id":"35","name":"7"},{"main":"62"},{"main":"56"},"Schedule Trigger","n8n-nodes-base.scheduleTrigger","workflow",{"x-api-key":"63","accept":"64"},"GET","http://app:3000/api/content/scheduled","","none","keypair",{"parameters":"65"},{},[],[],"success",{"main":"66"},["67"],[],"error",{"level":"14","tags":"15","description":"16","timestamp":1782913538127,"context":"17","functionality":"18","name":"19","node":"20","messages":"21","httpCode":"22","message":"23","stack":"24"},{"curlImport":"47","method":"45","url":"46","authentication":"48","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"49","headerParameters":"68","sendBody":false,"options":"69","infoMessage":"47"},[256,0],["70"],"**hidden**","application/json,text/html,application/xhtml+xml,application/xml,text/*;q=0.9, image/*;q=0.8, */*;q=0.7",["71"],["72"],{"previousNode":"41","previousNodeOutput":0,"previousNodeRun":0},{"parameters":"73"},{},["74"],{"name":"75","value":"76"},["77"],["78"],{"json":"79","pairedItem":"80"},"x-api-key","dev-n8n-api-key-change-in-production",{"json":"79","pairedItem":"81"},{"name":"75","value":"76"},{"timestamp":"82","Readable date":"83","Readable time":"84","Day of week":"85","Year":"86","Month":"87","Day of month":"88","Hour":"89","Minute":"90","Second":"91","Timezone":"92"},{"item":0},{"item":0},"2026-07-01T20:45:38.028+07:00","July 1st 2026, 8:45:38 pm","8:45:38 pm","Wednesday","2026","July","01","20","45","38","Asia/Bangkok (UTC+07:00)"]	958f9d58-aa29-4953-914f-a5f61de89b26
34	{"id":"Si28JZdUotdLzill","name":"content post","nodes":[{"parameters":{"notice":"","rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"curlImport":"","method":"GET","url":"http://app:3000/api/content/scheduled","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":false,"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"fieldToSplitOut":"items","include":"noOtherFields","options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"},{"parameters":{"curlImport":"","method":"PATCH","url":"=\\t http://app:3000/api/content/{{ $json.id }}","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":true,"contentType":"json","specifyBody":"keypair","bodyParameters":{"parameters":[{"name":"status","value":"posted"}]},"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[672,0],"id":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","name":"HTTP Request1"}],"connections":{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]},"Split Out":{"main":[[{"node":"HTTP Request1","type":"main","index":0}]]}},"settings":{"executionOrder":"v1","binaryMode":"separate","availableInMCP":false}}	[{"version":1,"startData":"1","resultData":"2","executionData":"3","resumeToken":"4"},{},{"error":"5","runData":"6","lastNodeExecuted":"7"},{"contextData":"8","nodeExecutionStack":"9","metadata":"10","waitingExecution":"11","waitingExecutionSource":"12","runtimeData":"13"},"b611f95fcaef76644bec8c79b95e77c0634d47163b637aa523add85d4db72fe9",{"level":"14","tags":"15","description":"16","timestamp":1782914438132,"context":"17","functionality":"18","name":"19","node":"20","messages":"21","httpCode":"22","message":"23","stack":"24"},{"Schedule Trigger":"25","HTTP Request":"26"},"HTTP Request",{},["27"],{},{},{},{"version":1,"establishedAt":1782914438038,"source":"28","triggerNode":"29","redaction":"30"},"warning",{},"500 - \\"\\"",{"itemIndex":0,"request":"31"},"regular","NodeApiError",{"parameters":"32","type":"33","typeVersion":4.4,"position":"34","id":"35","name":"7"},["16"],"500","The service was not able to process your request","NodeApiError: The service was not able to process your request\\n    at ExecuteContext.execute (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-nodes-base@file+packages+nodes-base_@aws-sdk+credential-providers@3.808.0_asn1.js@5_8da18263ca0574b0db58d4fefd8173ce/node_modules/n8n-nodes-base/nodes/HttpRequest/V3/HttpRequestV3.node.ts:869:16)\\n    at processTicksAndRejections (node:internal/process/task_queues:104:5)\\n    at WorkflowExecute.executeNode (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1067:8)\\n    at WorkflowExecute.runNode (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1367:11)\\n    at /usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1829:27\\n    at /usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:2521:11",["36"],["37"],{"node":"38","data":"39","source":"40"},"trigger",{"name":"41","type":"42"},{"version":2,"production":false,"manual":false,"source":"43"},{"headers":"44","method":"45","uri":"46","gzip":true,"rejectUnauthorized":true,"followRedirect":true,"resolveWithFullResponse":true,"sendCredentialsOnCrossOriginRedirect":false,"followAllRedirects":true,"timeout":300000,"encoding":null,"json":false,"useStream":true},{"curlImport":"47","method":"45","url":"46","authentication":"48","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"49","headerParameters":"50","sendBody":false,"options":"51","infoMessage":"47"},"n8n-nodes-base.httpRequest",[256,0],"c38b27ff-6b94-479f-be61-d469406da108",{"startTime":1782914438061,"executionIndex":0,"source":"52","hints":"53","executionTime":1,"executionStatus":"54","data":"55"},{"startTime":1782914438062,"executionIndex":1,"source":"56","hints":"57","executionTime":70,"executionStatus":"58","error":"59"},{"parameters":"60","type":"33","typeVersion":4.4,"position":"61","id":"35","name":"7"},{"main":"62"},{"main":"56"},"Schedule Trigger","n8n-nodes-base.scheduleTrigger","workflow",{"x-api-key":"63","accept":"64"},"GET","http://app:3000/api/content/scheduled","","none","keypair",{"parameters":"65"},{},[],[],"success",{"main":"66"},["67"],[],"error",{"level":"14","tags":"15","description":"16","timestamp":1782914438132,"context":"17","functionality":"18","name":"19","node":"20","messages":"21","httpCode":"22","message":"23","stack":"24"},{"curlImport":"47","method":"45","url":"46","authentication":"48","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"49","headerParameters":"68","sendBody":false,"options":"69","infoMessage":"47"},[256,0],["70"],"**hidden**","application/json,text/html,application/xhtml+xml,application/xml,text/*;q=0.9, image/*;q=0.8, */*;q=0.7",["71"],["72"],{"previousNode":"41","previousNodeOutput":0,"previousNodeRun":0},{"parameters":"73"},{},["74"],{"name":"75","value":"76"},["77"],["78"],{"json":"79","pairedItem":"80"},"x-api-key","dev-n8n-api-key-change-in-production",{"json":"79","pairedItem":"81"},{"name":"75","value":"76"},{"timestamp":"82","Readable date":"83","Readable time":"84","Day of week":"85","Year":"86","Month":"87","Day of month":"88","Hour":"89","Minute":"90","Second":"91","Timezone":"92"},{"item":0},{"item":0},"2026-07-01T21:00:38.035+07:00","July 1st 2026, 9:00:38 pm","9:00:38 pm","Wednesday","2026","July","01","21","00","38","Asia/Bangkok (UTC+07:00)"]	958f9d58-aa29-4953-914f-a5f61de89b26
35	{"id":"Si28JZdUotdLzill","name":"content post","nodes":[{"parameters":{"notice":"","rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"curlImport":"","method":"GET","url":"http://app:3000/api/content/scheduled","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":false,"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"fieldToSplitOut":"items","include":"noOtherFields","options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"},{"parameters":{"curlImport":"","method":"PATCH","url":"=\\t http://app:3000/api/content/{{ $json.id }}","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":true,"contentType":"json","specifyBody":"keypair","bodyParameters":{"parameters":[{"name":"status","value":"posted"}]},"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[672,0],"id":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","name":"HTTP Request1"}],"connections":{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]},"Split Out":{"main":[[{"node":"HTTP Request1","type":"main","index":0}]]}},"settings":{"executionOrder":"v1","binaryMode":"separate","availableInMCP":false}}	[{"version":1,"startData":"1","resultData":"2","executionData":"3","resumeToken":"4"},{},{"error":"5","runData":"6","lastNodeExecuted":"7"},{"contextData":"8","nodeExecutionStack":"9","metadata":"10","waitingExecution":"11","waitingExecutionSource":"12","runtimeData":"13"},"e807ff21ff48db8c17e420bb9aaddd0b9a0796236558a30edb7dd7d5d99f362b",{"level":"14","tags":"15","description":"16","timestamp":1782915338125,"context":"17","functionality":"18","name":"19","node":"20","messages":"21","httpCode":"22","message":"23","stack":"24"},{"Schedule Trigger":"25","HTTP Request":"26"},"HTTP Request",{},["27"],{},{},{},{"version":1,"establishedAt":1782915338044,"source":"28","triggerNode":"29","redaction":"30"},"warning",{},"500 - \\"\\"",{"itemIndex":0,"request":"31"},"regular","NodeApiError",{"parameters":"32","type":"33","typeVersion":4.4,"position":"34","id":"35","name":"7"},["16"],"500","The service was not able to process your request","NodeApiError: The service was not able to process your request\\n    at ExecuteContext.execute (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-nodes-base@file+packages+nodes-base_@aws-sdk+credential-providers@3.808.0_asn1.js@5_8da18263ca0574b0db58d4fefd8173ce/node_modules/n8n-nodes-base/nodes/HttpRequest/V3/HttpRequestV3.node.ts:869:16)\\n    at processTicksAndRejections (node:internal/process/task_queues:104:5)\\n    at WorkflowExecute.executeNode (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1067:8)\\n    at WorkflowExecute.runNode (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1367:11)\\n    at /usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1829:27\\n    at /usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:2521:11",["36"],["37"],{"node":"38","data":"39","source":"40"},"trigger",{"name":"41","type":"42"},{"version":2,"production":false,"manual":false,"source":"43"},{"headers":"44","method":"45","uri":"46","gzip":true,"rejectUnauthorized":true,"followRedirect":true,"resolveWithFullResponse":true,"sendCredentialsOnCrossOriginRedirect":false,"followAllRedirects":true,"timeout":300000,"encoding":null,"json":false,"useStream":true},{"curlImport":"47","method":"45","url":"46","authentication":"48","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"49","headerParameters":"50","sendBody":false,"options":"51","infoMessage":"47"},"n8n-nodes-base.httpRequest",[256,0],"c38b27ff-6b94-479f-be61-d469406da108",{"startTime":1782915338072,"executionIndex":0,"source":"52","hints":"53","executionTime":0,"executionStatus":"54","data":"55"},{"startTime":1782915338072,"executionIndex":1,"source":"56","hints":"57","executionTime":53,"executionStatus":"58","error":"59"},{"parameters":"60","type":"33","typeVersion":4.4,"position":"61","id":"35","name":"7"},{"main":"62"},{"main":"56"},"Schedule Trigger","n8n-nodes-base.scheduleTrigger","workflow",{"x-api-key":"63","accept":"64"},"GET","http://app:3000/api/content/scheduled","","none","keypair",{"parameters":"65"},{},[],[],"success",{"main":"66"},["67"],[],"error",{"level":"14","tags":"15","description":"16","timestamp":1782915338125,"context":"17","functionality":"18","name":"19","node":"20","messages":"21","httpCode":"22","message":"23","stack":"24"},{"curlImport":"47","method":"45","url":"46","authentication":"48","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"49","headerParameters":"68","sendBody":false,"options":"69","infoMessage":"47"},[256,0],["70"],"**hidden**","application/json,text/html,application/xhtml+xml,application/xml,text/*;q=0.9, image/*;q=0.8, */*;q=0.7",["71"],["72"],{"previousNode":"41","previousNodeOutput":0,"previousNodeRun":0},{"parameters":"73"},{},["74"],{"name":"75","value":"76"},["77"],["78"],{"json":"79","pairedItem":"80"},"x-api-key","dev-n8n-api-key-change-in-production",{"json":"79","pairedItem":"81"},{"name":"75","value":"76"},{"timestamp":"82","Readable date":"83","Readable time":"84","Day of week":"85","Year":"86","Month":"87","Day of month":"88","Hour":"89","Minute":"90","Second":"91","Timezone":"92"},{"item":0},{"item":0},"2026-07-01T21:15:38.042+07:00","July 1st 2026, 9:15:38 pm","9:15:38 pm","Wednesday","2026","July","01","21","15","38","Asia/Bangkok (UTC+07:00)"]	958f9d58-aa29-4953-914f-a5f61de89b26
36	{"id":"Si28JZdUotdLzill","name":"content post","nodes":[{"parameters":{"notice":"","rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"curlImport":"","method":"GET","url":"http://app:3000/api/content/scheduled","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":false,"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"fieldToSplitOut":"items","include":"noOtherFields","options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"},{"parameters":{"curlImport":"","method":"PATCH","url":"=\\t http://app:3000/api/content/{{ $json.id }}","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":true,"contentType":"json","specifyBody":"keypair","bodyParameters":{"parameters":[{"name":"status","value":"posted"}]},"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[672,0],"id":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","name":"HTTP Request1"}],"connections":{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]},"Split Out":{"main":[[{"node":"HTTP Request1","type":"main","index":0}]]}},"settings":{"executionOrder":"v1","binaryMode":"separate","availableInMCP":false}}	[{"version":1,"startData":"1","resultData":"2","executionData":"3","resumeToken":"4"},{},{"error":"5","runData":"6","lastNodeExecuted":"7"},{"contextData":"8","nodeExecutionStack":"9","metadata":"10","waitingExecution":"11","waitingExecutionSource":"12","runtimeData":"13"},"93abf9d210eb49d28e0af46013db05e7b8666c1796be248873f060529cc1ecdf",{"level":"14","tags":"15","description":"16","timestamp":1782916238119,"context":"17","functionality":"18","name":"19","node":"20","messages":"21","httpCode":"22","message":"23","stack":"24"},{"Schedule Trigger":"25","HTTP Request":"26"},"HTTP Request",{},["27"],{},{},{},{"version":1,"establishedAt":1782916238033,"source":"28","triggerNode":"29","redaction":"30"},"warning",{},"500 - \\"\\"",{"itemIndex":0,"request":"31"},"regular","NodeApiError",{"parameters":"32","type":"33","typeVersion":4.4,"position":"34","id":"35","name":"7"},["16"],"500","The service was not able to process your request","NodeApiError: The service was not able to process your request\\n    at ExecuteContext.execute (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-nodes-base@file+packages+nodes-base_@aws-sdk+credential-providers@3.808.0_asn1.js@5_8da18263ca0574b0db58d4fefd8173ce/node_modules/n8n-nodes-base/nodes/HttpRequest/V3/HttpRequestV3.node.ts:869:16)\\n    at processTicksAndRejections (node:internal/process/task_queues:104:5)\\n    at WorkflowExecute.executeNode (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1067:8)\\n    at WorkflowExecute.runNode (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1367:11)\\n    at /usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1829:27\\n    at /usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:2521:11",["36"],["37"],{"node":"38","data":"39","source":"40"},"trigger",{"name":"41","type":"42"},{"version":2,"production":false,"manual":false,"source":"43"},{"headers":"44","method":"45","uri":"46","gzip":true,"rejectUnauthorized":true,"followRedirect":true,"resolveWithFullResponse":true,"sendCredentialsOnCrossOriginRedirect":false,"followAllRedirects":true,"timeout":300000,"encoding":null,"json":false,"useStream":true},{"curlImport":"47","method":"45","url":"46","authentication":"48","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"49","headerParameters":"50","sendBody":false,"options":"51","infoMessage":"47"},"n8n-nodes-base.httpRequest",[256,0],"c38b27ff-6b94-479f-be61-d469406da108",{"startTime":1782916238058,"executionIndex":0,"source":"52","hints":"53","executionTime":0,"executionStatus":"54","data":"55"},{"startTime":1782916238058,"executionIndex":1,"source":"56","hints":"57","executionTime":61,"executionStatus":"58","error":"59"},{"parameters":"60","type":"33","typeVersion":4.4,"position":"61","id":"35","name":"7"},{"main":"62"},{"main":"56"},"Schedule Trigger","n8n-nodes-base.scheduleTrigger","workflow",{"x-api-key":"63","accept":"64"},"GET","http://app:3000/api/content/scheduled","","none","keypair",{"parameters":"65"},{},[],[],"success",{"main":"66"},["67"],[],"error",{"level":"14","tags":"15","description":"16","timestamp":1782916238119,"context":"17","functionality":"18","name":"19","node":"20","messages":"21","httpCode":"22","message":"23","stack":"24"},{"curlImport":"47","method":"45","url":"46","authentication":"48","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"49","headerParameters":"68","sendBody":false,"options":"69","infoMessage":"47"},[256,0],["70"],"**hidden**","application/json,text/html,application/xhtml+xml,application/xml,text/*;q=0.9, image/*;q=0.8, */*;q=0.7",["71"],["72"],{"previousNode":"41","previousNodeOutput":0,"previousNodeRun":0},{"parameters":"73"},{},["74"],{"name":"75","value":"76"},["77"],["78"],{"json":"79","pairedItem":"80"},"x-api-key","dev-n8n-api-key-change-in-production",{"json":"79","pairedItem":"81"},{"name":"75","value":"76"},{"timestamp":"82","Readable date":"83","Readable time":"84","Day of week":"85","Year":"86","Month":"87","Day of month":"88","Hour":"89","Minute":"90","Second":"91","Timezone":"92"},{"item":0},{"item":0},"2026-07-01T21:30:38.029+07:00","July 1st 2026, 9:30:38 pm","9:30:38 pm","Wednesday","2026","July","01","21","30","38","Asia/Bangkok (UTC+07:00)"]	958f9d58-aa29-4953-914f-a5f61de89b26
37	{"id":"Si28JZdUotdLzill","name":"content post","nodes":[{"parameters":{"notice":"","rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"curlImport":"","method":"GET","url":"http://app:3000/api/content/scheduled","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":false,"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"fieldToSplitOut":"items","include":"noOtherFields","options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"},{"parameters":{"curlImport":"","method":"PATCH","url":"=\\t http://app:3000/api/content/{{ $json.id }}","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":true,"contentType":"json","specifyBody":"keypair","bodyParameters":{"parameters":[{"name":"status","value":"posted"}]},"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[672,0],"id":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","name":"HTTP Request1"}],"connections":{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]},"Split Out":{"main":[[{"node":"HTTP Request1","type":"main","index":0}]]}},"settings":{"executionOrder":"v1","binaryMode":"separate","availableInMCP":false}}	[{"version":1,"startData":"1","resultData":"2","executionData":"3","resumeToken":"4"},{},{"error":"5","runData":"6","lastNodeExecuted":"7"},{"contextData":"8","nodeExecutionStack":"9","metadata":"10","waitingExecution":"11","waitingExecutionSource":"12","runtimeData":"13"},"990b45ddfed1c06047fd1dbc136755d336bbfb2e0be2a48674e0e642bca7f5d3",{"level":"14","tags":"15","description":"16","timestamp":1782917138229,"context":"17","functionality":"18","name":"19","node":"20","messages":"21","httpCode":"22","message":"23","stack":"24"},{"Schedule Trigger":"25","HTTP Request":"26"},"HTTP Request",{},["27"],{},{},{},{"version":1,"establishedAt":1782917138045,"source":"28","triggerNode":"29","redaction":"30"},"warning",{},"500 - \\"\\"",{"itemIndex":0,"request":"31"},"regular","NodeApiError",{"parameters":"32","type":"33","typeVersion":4.4,"position":"34","id":"35","name":"7"},["16"],"500","The service was not able to process your request","NodeApiError: The service was not able to process your request\\n    at ExecuteContext.execute (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-nodes-base@file+packages+nodes-base_@aws-sdk+credential-providers@3.808.0_asn1.js@5_8da18263ca0574b0db58d4fefd8173ce/node_modules/n8n-nodes-base/nodes/HttpRequest/V3/HttpRequestV3.node.ts:869:16)\\n    at processTicksAndRejections (node:internal/process/task_queues:104:5)\\n    at WorkflowExecute.executeNode (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1067:8)\\n    at WorkflowExecute.runNode (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1367:11)\\n    at /usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1829:27\\n    at /usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:2521:11",["36"],["37"],{"node":"38","data":"39","source":"40"},"trigger",{"name":"41","type":"42"},{"version":2,"production":false,"manual":false,"source":"43"},{"headers":"44","method":"45","uri":"46","gzip":true,"rejectUnauthorized":true,"followRedirect":true,"resolveWithFullResponse":true,"sendCredentialsOnCrossOriginRedirect":false,"followAllRedirects":true,"timeout":300000,"encoding":null,"json":false,"useStream":true},{"curlImport":"47","method":"45","url":"46","authentication":"48","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"49","headerParameters":"50","sendBody":false,"options":"51","infoMessage":"47"},"n8n-nodes-base.httpRequest",[256,0],"c38b27ff-6b94-479f-be61-d469406da108",{"startTime":1782917138094,"executionIndex":0,"source":"52","hints":"53","executionTime":0,"executionStatus":"54","data":"55"},{"startTime":1782917138094,"executionIndex":1,"source":"56","hints":"57","executionTime":136,"executionStatus":"58","error":"59"},{"parameters":"60","type":"33","typeVersion":4.4,"position":"61","id":"35","name":"7"},{"main":"62"},{"main":"56"},"Schedule Trigger","n8n-nodes-base.scheduleTrigger","workflow",{"x-api-key":"63","accept":"64"},"GET","http://app:3000/api/content/scheduled","","none","keypair",{"parameters":"65"},{},[],[],"success",{"main":"66"},["67"],[],"error",{"level":"14","tags":"15","description":"16","timestamp":1782917138229,"context":"17","functionality":"18","name":"19","node":"20","messages":"21","httpCode":"22","message":"23","stack":"24"},{"curlImport":"47","method":"45","url":"46","authentication":"48","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"49","headerParameters":"68","sendBody":false,"options":"69","infoMessage":"47"},[256,0],["70"],"**hidden**","application/json,text/html,application/xhtml+xml,application/xml,text/*;q=0.9, image/*;q=0.8, */*;q=0.7",["71"],["72"],{"previousNode":"41","previousNodeOutput":0,"previousNodeRun":0},{"parameters":"73"},{},["74"],{"name":"75","value":"76"},["77"],["78"],{"json":"79","pairedItem":"80"},"x-api-key","dev-n8n-api-key-change-in-production",{"json":"79","pairedItem":"81"},{"name":"75","value":"76"},{"timestamp":"82","Readable date":"83","Readable time":"84","Day of week":"85","Year":"86","Month":"87","Day of month":"88","Hour":"89","Minute":"90","Second":"91","Timezone":"92"},{"item":0},{"item":0},"2026-07-01T21:45:38.042+07:00","July 1st 2026, 9:45:38 pm","9:45:38 pm","Wednesday","2026","July","01","21","45","38","Asia/Bangkok (UTC+07:00)"]	958f9d58-aa29-4953-914f-a5f61de89b26
38	{"id":"Si28JZdUotdLzill","name":"content post","nodes":[{"parameters":{"notice":"","rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"curlImport":"","method":"GET","url":"http://app:3000/api/content/scheduled","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":false,"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"fieldToSplitOut":"items","include":"noOtherFields","options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"},{"parameters":{"curlImport":"","method":"PATCH","url":"=\\t http://app:3000/api/content/{{ $json.id }}","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":true,"contentType":"json","specifyBody":"keypair","bodyParameters":{"parameters":[{"name":"status","value":"posted"}]},"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[672,0],"id":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","name":"HTTP Request1"}],"connections":{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]},"Split Out":{"main":[[{"node":"HTTP Request1","type":"main","index":0}]]}},"settings":{"executionOrder":"v1","binaryMode":"separate","availableInMCP":false}}	[{"version":1,"startData":"1","resultData":"2","executionData":"3","resumeToken":"4"},{},{"error":"5","runData":"6","lastNodeExecuted":"7"},{"contextData":"8","nodeExecutionStack":"9","metadata":"10","waitingExecution":"11","waitingExecutionSource":"12","runtimeData":"13"},"79f94e8b59324a627e1a954b25924345bf44489c90e56ae3b7366c267dfda01d",{"level":"14","tags":"15","description":"16","timestamp":1782918067363,"context":"17","functionality":"18","name":"19","node":"20","messages":"21","httpCode":"22","message":"23","stack":"24"},{"Schedule Trigger":"25","HTTP Request":"26"},"HTTP Request",{},["27"],{},{},{},{"version":1,"establishedAt":1782918067127,"source":"28","triggerNode":"29","redaction":"30"},"warning",{},"500 - \\"\\"",{"itemIndex":0,"request":"31"},"regular","NodeApiError",{"parameters":"32","type":"33","typeVersion":4.4,"position":"34","id":"35","name":"7"},["16"],"500","The service was not able to process your request","NodeApiError: The service was not able to process your request\\n    at ExecuteContext.execute (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-nodes-base@file+packages+nodes-base_@aws-sdk+credential-providers@3.808.0_asn1.js@5_8da18263ca0574b0db58d4fefd8173ce/node_modules/n8n-nodes-base/nodes/HttpRequest/V3/HttpRequestV3.node.ts:869:16)\\n    at processTicksAndRejections (node:internal/process/task_queues:104:5)\\n    at WorkflowExecute.executeNode (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1067:8)\\n    at WorkflowExecute.runNode (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1367:11)\\n    at /usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1829:27\\n    at /usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:2521:11",["36"],["37"],{"node":"38","data":"39","source":"40"},"trigger",{"name":"41","type":"42"},{"version":2,"production":false,"manual":false,"source":"43"},{"headers":"44","method":"45","uri":"46","gzip":true,"rejectUnauthorized":true,"followRedirect":true,"resolveWithFullResponse":true,"sendCredentialsOnCrossOriginRedirect":false,"followAllRedirects":true,"timeout":300000,"encoding":null,"json":false,"useStream":true},{"curlImport":"47","method":"45","url":"46","authentication":"48","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"49","headerParameters":"50","sendBody":false,"options":"51","infoMessage":"47"},"n8n-nodes-base.httpRequest",[256,0],"c38b27ff-6b94-479f-be61-d469406da108",{"startTime":1782918067151,"executionIndex":0,"source":"52","hints":"53","executionTime":0,"executionStatus":"54","data":"55"},{"startTime":1782918067151,"executionIndex":1,"source":"56","hints":"57","executionTime":212,"executionStatus":"58","error":"59"},{"parameters":"60","type":"33","typeVersion":4.4,"position":"61","id":"35","name":"7"},{"main":"62"},{"main":"56"},"Schedule Trigger","n8n-nodes-base.scheduleTrigger","workflow",{"x-api-key":"63","accept":"64"},"GET","http://app:3000/api/content/scheduled","","none","keypair",{"parameters":"65"},{},[],[],"success",{"main":"66"},["67"],[],"error",{"level":"14","tags":"15","description":"16","timestamp":1782918067363,"context":"17","functionality":"18","name":"19","node":"20","messages":"21","httpCode":"22","message":"23","stack":"24"},{"curlImport":"47","method":"45","url":"46","authentication":"48","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"49","headerParameters":"68","sendBody":false,"options":"69","infoMessage":"47"},[256,0],["70"],"**hidden**","application/json,text/html,application/xhtml+xml,application/xml,text/*;q=0.9, image/*;q=0.8, */*;q=0.7",["71"],["72"],{"previousNode":"41","previousNodeOutput":0,"previousNodeRun":0},{"parameters":"73"},{},["74"],{"name":"75","value":"76"},["77"],["78"],{"json":"79","pairedItem":"80"},"x-api-key","dev-n8n-api-key-change-in-production",{"json":"79","pairedItem":"81"},{"name":"75","value":"76"},{"timestamp":"82","Readable date":"83","Readable time":"84","Day of week":"85","Year":"86","Month":"87","Day of month":"88","Hour":"89","Minute":"88","Second":"90","Timezone":"91"},{"item":0},{"item":0},"2026-07-01T22:01:07.126+07:00","July 1st 2026, 10:01:07 pm","10:01:07 pm","Wednesday","2026","July","01","22","07","Asia/Bangkok (UTC+07:00)"]	958f9d58-aa29-4953-914f-a5f61de89b26
39	{"id":"Si28JZdUotdLzill","name":"content post","nodes":[{"parameters":{"notice":"","rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"curlImport":"","method":"GET","url":"http://app:3000/api/content/scheduled","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":false,"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"fieldToSplitOut":"items","include":"noOtherFields","options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"},{"parameters":{"curlImport":"","method":"PATCH","url":"=\\t http://app:3000/api/content/{{ $json.id }}","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":true,"contentType":"json","specifyBody":"keypair","bodyParameters":{"parameters":[{"name":"status","value":"posted"}]},"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[672,0],"id":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","name":"HTTP Request1"}],"connections":{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]},"Split Out":{"main":[[{"node":"HTTP Request1","type":"main","index":0}]]}},"settings":{"executionOrder":"v1","binaryMode":"separate","availableInMCP":false}}	[{"version":1,"startData":"1","resultData":"2","executionData":"3","resumeToken":"4"},{},{"error":"5","runData":"6","lastNodeExecuted":"7"},{"contextData":"8","nodeExecutionStack":"9","metadata":"10","waitingExecution":"11","waitingExecutionSource":"12","runtimeData":"13"},"6110d180f7499830c63e691690a0c73252499f43b54d3034c4edecc38021cf8e",{"level":"14","tags":"15","description":"16","timestamp":1782918938158,"context":"17","functionality":"18","name":"19","node":"20","messages":"21","httpCode":"22","message":"23","stack":"24"},{"Schedule Trigger":"25","HTTP Request":"26"},"HTTP Request",{},["27"],{},{},{},{"version":1,"establishedAt":1782918938064,"source":"28","triggerNode":"29","redaction":"30"},"warning",{},"500 - \\"\\"",{"itemIndex":0,"request":"31"},"regular","NodeApiError",{"parameters":"32","type":"33","typeVersion":4.4,"position":"34","id":"35","name":"7"},["16"],"500","The service was not able to process your request","NodeApiError: The service was not able to process your request\\n    at ExecuteContext.execute (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-nodes-base@file+packages+nodes-base_@aws-sdk+credential-providers@3.808.0_asn1.js@5_8da18263ca0574b0db58d4fefd8173ce/node_modules/n8n-nodes-base/nodes/HttpRequest/V3/HttpRequestV3.node.ts:869:16)\\n    at processTicksAndRejections (node:internal/process/task_queues:104:5)\\n    at WorkflowExecute.executeNode (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1067:8)\\n    at WorkflowExecute.runNode (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1367:11)\\n    at /usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1829:27\\n    at /usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:2521:11",["36"],["37"],{"node":"38","data":"39","source":"40"},"trigger",{"name":"41","type":"42"},{"version":2,"production":false,"manual":false,"source":"43"},{"headers":"44","method":"45","uri":"46","gzip":true,"rejectUnauthorized":true,"followRedirect":true,"resolveWithFullResponse":true,"sendCredentialsOnCrossOriginRedirect":false,"followAllRedirects":true,"timeout":300000,"encoding":null,"json":false,"useStream":true},{"curlImport":"47","method":"45","url":"46","authentication":"48","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"49","headerParameters":"50","sendBody":false,"options":"51","infoMessage":"47"},"n8n-nodes-base.httpRequest",[256,0],"c38b27ff-6b94-479f-be61-d469406da108",{"startTime":1782918938109,"executionIndex":0,"source":"52","hints":"53","executionTime":0,"executionStatus":"54","data":"55"},{"startTime":1782918938109,"executionIndex":1,"source":"56","hints":"57","executionTime":49,"executionStatus":"58","error":"59"},{"parameters":"60","type":"33","typeVersion":4.4,"position":"61","id":"35","name":"7"},{"main":"62"},{"main":"56"},"Schedule Trigger","n8n-nodes-base.scheduleTrigger","workflow",{"x-api-key":"63","accept":"64"},"GET","http://app:3000/api/content/scheduled","","none","keypair",{"parameters":"65"},{},[],[],"success",{"main":"66"},["67"],[],"error",{"level":"14","tags":"15","description":"16","timestamp":1782918938158,"context":"17","functionality":"18","name":"19","node":"20","messages":"21","httpCode":"22","message":"23","stack":"24"},{"curlImport":"47","method":"45","url":"46","authentication":"48","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"49","headerParameters":"68","sendBody":false,"options":"69","infoMessage":"47"},[256,0],["70"],"**hidden**","application/json,text/html,application/xhtml+xml,application/xml,text/*;q=0.9, image/*;q=0.8, */*;q=0.7",["71"],["72"],{"previousNode":"41","previousNodeOutput":0,"previousNodeRun":0},{"parameters":"73"},{},["74"],{"name":"75","value":"76"},["77"],["78"],{"json":"79","pairedItem":"80"},"x-api-key","dev-n8n-api-key-change-in-production",{"json":"79","pairedItem":"81"},{"name":"75","value":"76"},{"timestamp":"82","Readable date":"83","Readable time":"84","Day of week":"85","Year":"86","Month":"87","Day of month":"88","Hour":"89","Minute":"90","Second":"91","Timezone":"92"},{"item":0},{"item":0},"2026-07-01T22:15:38.056+07:00","July 1st 2026, 10:15:38 pm","10:15:38 pm","Wednesday","2026","July","01","22","15","38","Asia/Bangkok (UTC+07:00)"]	958f9d58-aa29-4953-914f-a5f61de89b26
40	{"id":"Si28JZdUotdLzill","name":"content post","nodes":[{"parameters":{"notice":"","rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"curlImport":"","method":"GET","url":"http://app:3000/api/content/scheduled","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":false,"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"fieldToSplitOut":"items","include":"noOtherFields","options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"},{"parameters":{"curlImport":"","method":"PATCH","url":"=\\t http://app:3000/api/content/{{ $json.id }}","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":true,"contentType":"json","specifyBody":"keypair","bodyParameters":{"parameters":[{"name":"status","value":"posted"}]},"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[672,0],"id":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","name":"HTTP Request1"}],"connections":{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]},"Split Out":{"main":[[{"node":"HTTP Request1","type":"main","index":0}]]}},"settings":{"executionOrder":"v1","binaryMode":"separate","availableInMCP":false}}	[{"version":1,"startData":"1","resultData":"2","executionData":"3","resumeToken":"4"},{},{"error":"5","runData":"6","lastNodeExecuted":"7"},{"contextData":"8","nodeExecutionStack":"9","metadata":"10","waitingExecution":"11","waitingExecutionSource":"12","runtimeData":"13"},"20f9a8809ff7ab247e641b67b35b3b25b90985c7bd4207a0d66252aed87abfe5",{"level":"14","tags":"15","description":"16","timestamp":1782919838126,"context":"17","functionality":"18","name":"19","node":"20","messages":"21","httpCode":"22","message":"23","stack":"24"},{"Schedule Trigger":"25","HTTP Request":"26"},"HTTP Request",{},["27"],{},{},{},{"version":1,"establishedAt":1782919838060,"source":"28","triggerNode":"29","redaction":"30"},"warning",{},"500 - \\"\\"",{"itemIndex":0,"request":"31"},"regular","NodeApiError",{"parameters":"32","type":"33","typeVersion":4.4,"position":"34","id":"35","name":"7"},["16"],"500","The service was not able to process your request","NodeApiError: The service was not able to process your request\\n    at ExecuteContext.execute (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-nodes-base@file+packages+nodes-base_@aws-sdk+credential-providers@3.808.0_asn1.js@5_8da18263ca0574b0db58d4fefd8173ce/node_modules/n8n-nodes-base/nodes/HttpRequest/V3/HttpRequestV3.node.ts:869:16)\\n    at processTicksAndRejections (node:internal/process/task_queues:104:5)\\n    at WorkflowExecute.executeNode (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1067:8)\\n    at WorkflowExecute.runNode (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1367:11)\\n    at /usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1829:27\\n    at /usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:2521:11",["36"],["37"],{"node":"38","data":"39","source":"40"},"trigger",{"name":"41","type":"42"},{"version":2,"production":false,"manual":false,"source":"43"},{"headers":"44","method":"45","uri":"46","gzip":true,"rejectUnauthorized":true,"followRedirect":true,"resolveWithFullResponse":true,"sendCredentialsOnCrossOriginRedirect":false,"followAllRedirects":true,"timeout":300000,"encoding":null,"json":false,"useStream":true},{"curlImport":"47","method":"45","url":"46","authentication":"48","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"49","headerParameters":"50","sendBody":false,"options":"51","infoMessage":"47"},"n8n-nodes-base.httpRequest",[256,0],"c38b27ff-6b94-479f-be61-d469406da108",{"startTime":1782919838082,"executionIndex":0,"source":"52","hints":"53","executionTime":0,"executionStatus":"54","data":"55"},{"startTime":1782919838082,"executionIndex":1,"source":"56","hints":"57","executionTime":44,"executionStatus":"58","error":"59"},{"parameters":"60","type":"33","typeVersion":4.4,"position":"61","id":"35","name":"7"},{"main":"62"},{"main":"56"},"Schedule Trigger","n8n-nodes-base.scheduleTrigger","workflow",{"x-api-key":"63","accept":"64"},"GET","http://app:3000/api/content/scheduled","","none","keypair",{"parameters":"65"},{},[],[],"success",{"main":"66"},["67"],[],"error",{"level":"14","tags":"15","description":"16","timestamp":1782919838126,"context":"17","functionality":"18","name":"19","node":"20","messages":"21","httpCode":"22","message":"23","stack":"24"},{"curlImport":"47","method":"45","url":"46","authentication":"48","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"49","headerParameters":"68","sendBody":false,"options":"69","infoMessage":"47"},[256,0],["70"],"**hidden**","application/json,text/html,application/xhtml+xml,application/xml,text/*;q=0.9, image/*;q=0.8, */*;q=0.7",["71"],["72"],{"previousNode":"41","previousNodeOutput":0,"previousNodeRun":0},{"parameters":"73"},{},["74"],{"name":"75","value":"76"},["77"],["78"],{"json":"79","pairedItem":"80"},"x-api-key","dev-n8n-api-key-change-in-production",{"json":"79","pairedItem":"81"},{"name":"75","value":"76"},{"timestamp":"82","Readable date":"83","Readable time":"84","Day of week":"85","Year":"86","Month":"87","Day of month":"88","Hour":"89","Minute":"90","Second":"91","Timezone":"92"},{"item":0},{"item":0},"2026-07-01T22:30:38.058+07:00","July 1st 2026, 10:30:38 pm","10:30:38 pm","Wednesday","2026","July","01","22","30","38","Asia/Bangkok (UTC+07:00)"]	958f9d58-aa29-4953-914f-a5f61de89b26
41	{"id":"Si28JZdUotdLzill","name":"content post","nodes":[{"parameters":{"notice":"","rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"curlImport":"","method":"GET","url":"http://app:3000/api/content/scheduled","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":false,"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"fieldToSplitOut":"items","include":"noOtherFields","options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"},{"parameters":{"curlImport":"","method":"PATCH","url":"=\\t http://app:3000/api/content/{{ $json.id }}","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":true,"contentType":"json","specifyBody":"keypair","bodyParameters":{"parameters":[{"name":"status","value":"posted"}]},"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[672,0],"id":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","name":"HTTP Request1"}],"connections":{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]},"Split Out":{"main":[[{"node":"HTTP Request1","type":"main","index":0}]]}},"settings":{"executionOrder":"v1","binaryMode":"separate","availableInMCP":false}}	[{"version":1,"startData":"1","resultData":"2","executionData":"3","resumeToken":"4"},{},{"error":"5","runData":"6","lastNodeExecuted":"7"},{"contextData":"8","nodeExecutionStack":"9","metadata":"10","waitingExecution":"11","waitingExecutionSource":"12","runtimeData":"13"},"64b24c84eb74e0760b9bbb5bb1117fc2daad2ff490a2701b94ed64099e32c95d",{"level":"14","tags":"15","description":"16","timestamp":1782920738143,"context":"17","functionality":"18","name":"19","node":"20","messages":"21","httpCode":"22","message":"23","stack":"24"},{"Schedule Trigger":"25","HTTP Request":"26"},"HTTP Request",{},["27"],{},{},{},{"version":1,"establishedAt":1782920738067,"source":"28","triggerNode":"29","redaction":"30"},"warning",{},"500 - \\"\\"",{"itemIndex":0,"request":"31"},"regular","NodeApiError",{"parameters":"32","type":"33","typeVersion":4.4,"position":"34","id":"35","name":"7"},["16"],"500","The service was not able to process your request","NodeApiError: The service was not able to process your request\\n    at ExecuteContext.execute (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-nodes-base@file+packages+nodes-base_@aws-sdk+credential-providers@3.808.0_asn1.js@5_8da18263ca0574b0db58d4fefd8173ce/node_modules/n8n-nodes-base/nodes/HttpRequest/V3/HttpRequestV3.node.ts:869:16)\\n    at processTicksAndRejections (node:internal/process/task_queues:104:5)\\n    at WorkflowExecute.executeNode (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1067:8)\\n    at WorkflowExecute.runNode (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1367:11)\\n    at /usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1829:27\\n    at /usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:2521:11",["36"],["37"],{"node":"38","data":"39","source":"40"},"trigger",{"name":"41","type":"42"},{"version":2,"production":false,"manual":false,"source":"43"},{"headers":"44","method":"45","uri":"46","gzip":true,"rejectUnauthorized":true,"followRedirect":true,"resolveWithFullResponse":true,"sendCredentialsOnCrossOriginRedirect":false,"followAllRedirects":true,"timeout":300000,"encoding":null,"json":false,"useStream":true},{"curlImport":"47","method":"45","url":"46","authentication":"48","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"49","headerParameters":"50","sendBody":false,"options":"51","infoMessage":"47"},"n8n-nodes-base.httpRequest",[256,0],"c38b27ff-6b94-479f-be61-d469406da108",{"startTime":1782920738087,"executionIndex":0,"source":"52","hints":"53","executionTime":0,"executionStatus":"54","data":"55"},{"startTime":1782920738087,"executionIndex":1,"source":"56","hints":"57","executionTime":57,"executionStatus":"58","error":"59"},{"parameters":"60","type":"33","typeVersion":4.4,"position":"61","id":"35","name":"7"},{"main":"62"},{"main":"56"},"Schedule Trigger","n8n-nodes-base.scheduleTrigger","workflow",{"x-api-key":"63","accept":"64"},"GET","http://app:3000/api/content/scheduled","","none","keypair",{"parameters":"65"},{},[],[],"success",{"main":"66"},["67"],[],"error",{"level":"14","tags":"15","description":"16","timestamp":1782920738143,"context":"17","functionality":"18","name":"19","node":"20","messages":"21","httpCode":"22","message":"23","stack":"24"},{"curlImport":"47","method":"45","url":"46","authentication":"48","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"49","headerParameters":"68","sendBody":false,"options":"69","infoMessage":"47"},[256,0],["70"],"**hidden**","application/json,text/html,application/xhtml+xml,application/xml,text/*;q=0.9, image/*;q=0.8, */*;q=0.7",["71"],["72"],{"previousNode":"41","previousNodeOutput":0,"previousNodeRun":0},{"parameters":"73"},{},["74"],{"name":"75","value":"76"},["77"],["78"],{"json":"79","pairedItem":"80"},"x-api-key","dev-n8n-api-key-change-in-production",{"json":"79","pairedItem":"81"},{"name":"75","value":"76"},{"timestamp":"82","Readable date":"83","Readable time":"84","Day of week":"85","Year":"86","Month":"87","Day of month":"88","Hour":"89","Minute":"90","Second":"91","Timezone":"92"},{"item":0},{"item":0},"2026-07-01T22:45:38.066+07:00","July 1st 2026, 10:45:38 pm","10:45:38 pm","Wednesday","2026","July","01","22","45","38","Asia/Bangkok (UTC+07:00)"]	958f9d58-aa29-4953-914f-a5f61de89b26
42	{"id":"Si28JZdUotdLzill","name":"content post","nodes":[{"parameters":{"notice":"","rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"curlImport":"","method":"GET","url":"http://app:3000/api/content/scheduled","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":false,"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"fieldToSplitOut":"items","include":"noOtherFields","options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"},{"parameters":{"curlImport":"","method":"PATCH","url":"=\\t http://app:3000/api/content/{{ $json.id }}","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":true,"contentType":"json","specifyBody":"keypair","bodyParameters":{"parameters":[{"name":"status","value":"posted"}]},"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[672,0],"id":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","name":"HTTP Request1"}],"connections":{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]},"Split Out":{"main":[[{"node":"HTTP Request1","type":"main","index":0}]]}},"settings":{"executionOrder":"v1","binaryMode":"separate","availableInMCP":false}}	[{"version":1,"startData":"1","resultData":"2","executionData":"3","resumeToken":"4"},{},{"error":"5","runData":"6","lastNodeExecuted":"7"},{"contextData":"8","nodeExecutionStack":"9","metadata":"10","waitingExecution":"11","waitingExecutionSource":"12","runtimeData":"13"},"4bffcbc9674f67ea02f65a1cb5ce24a6759ee91553b7735de07c276eeb22f184",{"level":"14","tags":"15","description":"16","timestamp":1782921638128,"context":"17","functionality":"18","name":"19","node":"20","messages":"21","httpCode":"22","message":"23","stack":"24"},{"Schedule Trigger":"25","HTTP Request":"26"},"HTTP Request",{},["27"],{},{},{},{"version":1,"establishedAt":1782921638043,"source":"28","triggerNode":"29","redaction":"30"},"warning",{},"500 - \\"\\"",{"itemIndex":0,"request":"31"},"regular","NodeApiError",{"parameters":"32","type":"33","typeVersion":4.4,"position":"34","id":"35","name":"7"},["16"],"500","The service was not able to process your request","NodeApiError: The service was not able to process your request\\n    at ExecuteContext.execute (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-nodes-base@file+packages+nodes-base_@aws-sdk+credential-providers@3.808.0_asn1.js@5_8da18263ca0574b0db58d4fefd8173ce/node_modules/n8n-nodes-base/nodes/HttpRequest/V3/HttpRequestV3.node.ts:869:16)\\n    at processTicksAndRejections (node:internal/process/task_queues:104:5)\\n    at WorkflowExecute.executeNode (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1067:8)\\n    at WorkflowExecute.runNode (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1367:11)\\n    at /usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1829:27\\n    at /usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:2521:11",["36"],["37"],{"node":"38","data":"39","source":"40"},"trigger",{"name":"41","type":"42"},{"version":2,"production":false,"manual":false,"source":"43"},{"headers":"44","method":"45","uri":"46","gzip":true,"rejectUnauthorized":true,"followRedirect":true,"resolveWithFullResponse":true,"sendCredentialsOnCrossOriginRedirect":false,"followAllRedirects":true,"timeout":300000,"encoding":null,"json":false,"useStream":true},{"curlImport":"47","method":"45","url":"46","authentication":"48","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"49","headerParameters":"50","sendBody":false,"options":"51","infoMessage":"47"},"n8n-nodes-base.httpRequest",[256,0],"c38b27ff-6b94-479f-be61-d469406da108",{"startTime":1782921638085,"executionIndex":0,"source":"52","hints":"53","executionTime":0,"executionStatus":"54","data":"55"},{"startTime":1782921638085,"executionIndex":1,"source":"56","hints":"57","executionTime":43,"executionStatus":"58","error":"59"},{"parameters":"60","type":"33","typeVersion":4.4,"position":"61","id":"35","name":"7"},{"main":"62"},{"main":"56"},"Schedule Trigger","n8n-nodes-base.scheduleTrigger","workflow",{"x-api-key":"63","accept":"64"},"GET","http://app:3000/api/content/scheduled","","none","keypair",{"parameters":"65"},{},[],[],"success",{"main":"66"},["67"],[],"error",{"level":"14","tags":"15","description":"16","timestamp":1782921638128,"context":"17","functionality":"18","name":"19","node":"20","messages":"21","httpCode":"22","message":"23","stack":"24"},{"curlImport":"47","method":"45","url":"46","authentication":"48","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"49","headerParameters":"68","sendBody":false,"options":"69","infoMessage":"47"},[256,0],["70"],"**hidden**","application/json,text/html,application/xhtml+xml,application/xml,text/*;q=0.9, image/*;q=0.8, */*;q=0.7",["71"],["72"],{"previousNode":"41","previousNodeOutput":0,"previousNodeRun":0},{"parameters":"73"},{},["74"],{"name":"75","value":"76"},["77"],["78"],{"json":"79","pairedItem":"80"},"x-api-key","dev-n8n-api-key-change-in-production",{"json":"79","pairedItem":"81"},{"name":"75","value":"76"},{"timestamp":"82","Readable date":"83","Readable time":"84","Day of week":"85","Year":"86","Month":"87","Day of month":"88","Hour":"89","Minute":"90","Second":"91","Timezone":"92"},{"item":0},{"item":0},"2026-07-01T23:00:38.040+07:00","July 1st 2026, 11:00:38 pm","11:00:38 pm","Wednesday","2026","July","01","23","00","38","Asia/Bangkok (UTC+07:00)"]	958f9d58-aa29-4953-914f-a5f61de89b26
43	{"id":"Si28JZdUotdLzill","name":"content post","nodes":[{"parameters":{"notice":"","rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"curlImport":"","method":"GET","url":"http://app:3000/api/content/scheduled","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":false,"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"fieldToSplitOut":"items","include":"noOtherFields","options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"},{"parameters":{"curlImport":"","method":"PATCH","url":"=\\t http://app:3000/api/content/{{ $json.id }}","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":true,"contentType":"json","specifyBody":"keypair","bodyParameters":{"parameters":[{"name":"status","value":"posted"}]},"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[672,0],"id":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","name":"HTTP Request1"}],"connections":{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]},"Split Out":{"main":[[{"node":"HTTP Request1","type":"main","index":0}]]}},"settings":{"executionOrder":"v1","binaryMode":"separate","availableInMCP":false}}	[{"version":1,"startData":"1","resultData":"2","executionData":"3","resumeToken":"4"},{},{"error":"5","runData":"6","lastNodeExecuted":"7"},{"contextData":"8","nodeExecutionStack":"9","metadata":"10","waitingExecution":"11","waitingExecutionSource":"12","runtimeData":"13"},"ff791a9f8405fa1ef4d4d9fa9b887206f69077e5bc0fb8ffb99cc9186c17e6e3",{"level":"14","tags":"15","description":"16","timestamp":1782922538119,"context":"17","functionality":"18","name":"19","node":"20","messages":"21","httpCode":"22","message":"23","stack":"24"},{"Schedule Trigger":"25","HTTP Request":"26"},"HTTP Request",{},["27"],{},{},{},{"version":1,"establishedAt":1782922538045,"source":"28","triggerNode":"29","redaction":"30"},"warning",{},"500 - \\"\\"",{"itemIndex":0,"request":"31"},"regular","NodeApiError",{"parameters":"32","type":"33","typeVersion":4.4,"position":"34","id":"35","name":"7"},["16"],"500","The service was not able to process your request","NodeApiError: The service was not able to process your request\\n    at ExecuteContext.execute (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-nodes-base@file+packages+nodes-base_@aws-sdk+credential-providers@3.808.0_asn1.js@5_8da18263ca0574b0db58d4fefd8173ce/node_modules/n8n-nodes-base/nodes/HttpRequest/V3/HttpRequestV3.node.ts:869:16)\\n    at processTicksAndRejections (node:internal/process/task_queues:104:5)\\n    at WorkflowExecute.executeNode (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1067:8)\\n    at WorkflowExecute.runNode (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1367:11)\\n    at /usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1829:27\\n    at /usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:2521:11",["36"],["37"],{"node":"38","data":"39","source":"40"},"trigger",{"name":"41","type":"42"},{"version":2,"production":false,"manual":false,"source":"43"},{"headers":"44","method":"45","uri":"46","gzip":true,"rejectUnauthorized":true,"followRedirect":true,"resolveWithFullResponse":true,"sendCredentialsOnCrossOriginRedirect":false,"followAllRedirects":true,"timeout":300000,"encoding":null,"json":false,"useStream":true},{"curlImport":"47","method":"45","url":"46","authentication":"48","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"49","headerParameters":"50","sendBody":false,"options":"51","infoMessage":"47"},"n8n-nodes-base.httpRequest",[256,0],"c38b27ff-6b94-479f-be61-d469406da108",{"startTime":1782922538075,"executionIndex":0,"source":"52","hints":"53","executionTime":0,"executionStatus":"54","data":"55"},{"startTime":1782922538075,"executionIndex":1,"source":"56","hints":"57","executionTime":45,"executionStatus":"58","error":"59"},{"parameters":"60","type":"33","typeVersion":4.4,"position":"61","id":"35","name":"7"},{"main":"62"},{"main":"56"},"Schedule Trigger","n8n-nodes-base.scheduleTrigger","workflow",{"x-api-key":"63","accept":"64"},"GET","http://app:3000/api/content/scheduled","","none","keypair",{"parameters":"65"},{},[],[],"success",{"main":"66"},["67"],[],"error",{"level":"14","tags":"15","description":"16","timestamp":1782922538119,"context":"17","functionality":"18","name":"19","node":"20","messages":"21","httpCode":"22","message":"23","stack":"24"},{"curlImport":"47","method":"45","url":"46","authentication":"48","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"49","headerParameters":"68","sendBody":false,"options":"69","infoMessage":"47"},[256,0],["70"],"**hidden**","application/json,text/html,application/xhtml+xml,application/xml,text/*;q=0.9, image/*;q=0.8, */*;q=0.7",["71"],["72"],{"previousNode":"41","previousNodeOutput":0,"previousNodeRun":0},{"parameters":"73"},{},["74"],{"name":"75","value":"76"},["77"],["78"],{"json":"79","pairedItem":"80"},"x-api-key","dev-n8n-api-key-change-in-production",{"json":"79","pairedItem":"81"},{"name":"75","value":"76"},{"timestamp":"82","Readable date":"83","Readable time":"84","Day of week":"85","Year":"86","Month":"87","Day of month":"88","Hour":"89","Minute":"90","Second":"91","Timezone":"92"},{"item":0},{"item":0},"2026-07-01T23:15:38.044+07:00","July 1st 2026, 11:15:38 pm","11:15:38 pm","Wednesday","2026","July","01","23","15","38","Asia/Bangkok (UTC+07:00)"]	958f9d58-aa29-4953-914f-a5f61de89b26
44	{"id":"Si28JZdUotdLzill","name":"content post","nodes":[{"parameters":{"notice":"","rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"curlImport":"","method":"GET","url":"http://app:3000/api/content/scheduled","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":false,"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"fieldToSplitOut":"items","include":"noOtherFields","options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"},{"parameters":{"curlImport":"","method":"PATCH","url":"=\\t http://app:3000/api/content/{{ $json.id }}","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":true,"contentType":"json","specifyBody":"keypair","bodyParameters":{"parameters":[{"name":"status","value":"posted"}]},"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[672,0],"id":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","name":"HTTP Request1"}],"connections":{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]},"Split Out":{"main":[[{"node":"HTTP Request1","type":"main","index":0}]]}},"settings":{"executionOrder":"v1","binaryMode":"separate","availableInMCP":false}}	[{"version":1,"startData":"1","resultData":"2","executionData":"3","resumeToken":"4"},{},{"error":"5","runData":"6","lastNodeExecuted":"7"},{"contextData":"8","nodeExecutionStack":"9","metadata":"10","waitingExecution":"11","waitingExecutionSource":"12","runtimeData":"13"},"01a1d3013ab76f8e4bdda47caf5662bcfb6d3962c4d50d95ac33668a675d7659",{"level":"14","tags":"15","description":"16","timestamp":1782923438123,"context":"17","functionality":"18","name":"19","node":"20","messages":"21","httpCode":"22","message":"23","stack":"24"},{"Schedule Trigger":"25","HTTP Request":"26"},"HTTP Request",{},["27"],{},{},{},{"version":1,"establishedAt":1782923438031,"source":"28","triggerNode":"29","redaction":"30"},"warning",{},"500 - \\"\\"",{"itemIndex":0,"request":"31"},"regular","NodeApiError",{"parameters":"32","type":"33","typeVersion":4.4,"position":"34","id":"35","name":"7"},["16"],"500","The service was not able to process your request","NodeApiError: The service was not able to process your request\\n    at ExecuteContext.execute (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-nodes-base@file+packages+nodes-base_@aws-sdk+credential-providers@3.808.0_asn1.js@5_8da18263ca0574b0db58d4fefd8173ce/node_modules/n8n-nodes-base/nodes/HttpRequest/V3/HttpRequestV3.node.ts:869:16)\\n    at processTicksAndRejections (node:internal/process/task_queues:104:5)\\n    at WorkflowExecute.executeNode (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1067:8)\\n    at WorkflowExecute.runNode (/usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1367:11)\\n    at /usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1829:27\\n    at /usr/local/lib/node_modules/n8n/node_modules/.pnpm/n8n-core@file+packages+core_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-otlp_cf5896492347c4895f0373f4acc773d7/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:2521:11",["36"],["37"],{"node":"38","data":"39","source":"40"},"trigger",{"name":"41","type":"42"},{"version":2,"production":false,"manual":false,"source":"43"},{"headers":"44","method":"45","uri":"46","gzip":true,"rejectUnauthorized":true,"followRedirect":true,"resolveWithFullResponse":true,"sendCredentialsOnCrossOriginRedirect":false,"followAllRedirects":true,"timeout":300000,"encoding":null,"json":false,"useStream":true},{"curlImport":"47","method":"45","url":"46","authentication":"48","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"49","headerParameters":"50","sendBody":false,"options":"51","infoMessage":"47"},"n8n-nodes-base.httpRequest",[256,0],"c38b27ff-6b94-479f-be61-d469406da108",{"startTime":1782923438058,"executionIndex":0,"source":"52","hints":"53","executionTime":0,"executionStatus":"54","data":"55"},{"startTime":1782923438058,"executionIndex":1,"source":"56","hints":"57","executionTime":65,"executionStatus":"58","error":"59"},{"parameters":"60","type":"33","typeVersion":4.4,"position":"61","id":"35","name":"7"},{"main":"62"},{"main":"56"},"Schedule Trigger","n8n-nodes-base.scheduleTrigger","workflow",{"x-api-key":"63","accept":"64"},"GET","http://app:3000/api/content/scheduled","","none","keypair",{"parameters":"65"},{},[],[],"success",{"main":"66"},["67"],[],"error",{"level":"14","tags":"15","description":"16","timestamp":1782923438123,"context":"17","functionality":"18","name":"19","node":"20","messages":"21","httpCode":"22","message":"23","stack":"24"},{"curlImport":"47","method":"45","url":"46","authentication":"48","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"49","headerParameters":"68","sendBody":false,"options":"69","infoMessage":"47"},[256,0],["70"],"**hidden**","application/json,text/html,application/xhtml+xml,application/xml,text/*;q=0.9, image/*;q=0.8, */*;q=0.7",["71"],["72"],{"previousNode":"41","previousNodeOutput":0,"previousNodeRun":0},{"parameters":"73"},{},["74"],{"name":"75","value":"76"},["77"],["78"],{"json":"79","pairedItem":"80"},"x-api-key","dev-n8n-api-key-change-in-production",{"json":"79","pairedItem":"81"},{"name":"75","value":"76"},{"timestamp":"82","Readable date":"83","Readable time":"84","Day of week":"85","Year":"86","Month":"87","Day of month":"88","Hour":"89","Minute":"90","Second":"91","Timezone":"92"},{"item":0},{"item":0},"2026-07-01T23:30:38.027+07:00","July 1st 2026, 11:30:38 pm","11:30:38 pm","Wednesday","2026","July","01","23","30","38","Asia/Bangkok (UTC+07:00)"]	958f9d58-aa29-4953-914f-a5f61de89b26
45	{"id":"Si28JZdUotdLzill","name":"content post","nodes":[{"parameters":{"notice":"","rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"curlImport":"","method":"GET","url":"http://app:3000/api/content/scheduled","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":false,"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"fieldToSplitOut":"items","include":"noOtherFields","options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"},{"parameters":{"curlImport":"","method":"PATCH","url":"=\\t http://app:3000/api/content/{{ $json.id }}","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":true,"contentType":"json","specifyBody":"keypair","bodyParameters":{"parameters":[{"name":"status","value":"posted"}]},"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[672,0],"id":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","name":"HTTP Request1"}],"connections":{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]},"Split Out":{"main":[[{"node":"HTTP Request1","type":"main","index":0}]]}},"settings":{"executionOrder":"v1","binaryMode":"separate","availableInMCP":false}}	[{"version":1,"startData":"1","resultData":"2","executionData":"3","resumeToken":"4"},{},{"runData":"5","lastNodeExecuted":"6"},{"contextData":"7","nodeExecutionStack":"8","metadata":"9","waitingExecution":"10","waitingExecutionSource":"11","runtimeData":"12"},"589151b34169a79efeb8fc099f9ce172b5f9c8044dd5958d18cd9dc6c130ff22",{"Schedule Trigger":"13","HTTP Request":"14","Split Out":"15"},"Split Out",{},[],{},{},{},{"version":1,"establishedAt":1782924338039,"source":"16","triggerNode":"17","redaction":"18"},["19"],["20"],["21"],"trigger",{"name":"22","type":"23"},{"version":2,"production":false,"manual":false,"source":"24"},{"startTime":1782924338069,"executionIndex":0,"source":"25","hints":"26","executionTime":0,"executionStatus":"27","data":"28"},{"startTime":1782924338069,"executionIndex":1,"source":"29","hints":"30","executionTime":250,"executionStatus":"27","data":"31"},{"startTime":1782924338319,"executionIndex":2,"source":"32","hints":"33","executionTime":1,"executionStatus":"27","data":"34"},"Schedule Trigger","n8n-nodes-base.scheduleTrigger","workflow",[],[],"success",{"main":"35"},["36"],[],{"main":"37"},["38"],[],{"main":"39"},["40"],{"previousNode":"22","previousNodeOutput":0,"previousNodeRun":0},["41"],{"previousNode":"42","previousNodeOutput":0,"previousNodeRun":0},["43"],["44"],["45"],"HTTP Request",[],{"json":"46","pairedItem":"47"},{"json":"48","pairedItem":"49"},{"timestamp":"50","Readable date":"51","Readable time":"52","Day of week":"53","Year":"54","Month":"55","Day of month":"56","Hour":"57","Minute":"58","Second":"59","Timezone":"60"},{"item":0},{"count":0,"items":"61"},{"item":0},"2026-07-01T23:45:38.034+07:00","July 1st 2026, 11:45:38 pm","11:45:38 pm","Wednesday","2026","July","01","23","45","38","Asia/Bangkok (UTC+07:00)",[]]	958f9d58-aa29-4953-914f-a5f61de89b26
46	{"id":"Si28JZdUotdLzill","name":"content post","nodes":[{"parameters":{"notice":"","rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"curlImport":"","method":"GET","url":"http://app:3000/api/content/scheduled","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":false,"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"fieldToSplitOut":"items","include":"noOtherFields","options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"},{"parameters":{"curlImport":"","method":"PATCH","url":"=\\t http://app:3000/api/content/{{ $json.id }}","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":true,"contentType":"json","specifyBody":"keypair","bodyParameters":{"parameters":[{"name":"status","value":"posted"}]},"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[672,0],"id":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","name":"HTTP Request1"}],"connections":{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]},"Split Out":{"main":[[{"node":"HTTP Request1","type":"main","index":0}]]}},"settings":{"executionOrder":"v1","binaryMode":"separate","availableInMCP":false}}	[{"version":1,"startData":"1","resultData":"2","executionData":"3","resumeToken":"4"},{},{"runData":"5","lastNodeExecuted":"6"},{"contextData":"7","nodeExecutionStack":"8","metadata":"9","waitingExecution":"10","waitingExecutionSource":"11","runtimeData":"12"},"889a8b8daf9515a3bd0fe154f405f8aa38fafdf2fafeac031eecbc64fc6d9c7c",{"Schedule Trigger":"13","HTTP Request":"14","Split Out":"15"},"Split Out",{},[],{},{},{},{"version":1,"establishedAt":1782925238037,"source":"16","triggerNode":"17","redaction":"18"},["19"],["20"],["21"],"trigger",{"name":"22","type":"23"},{"version":2,"production":false,"manual":false,"source":"24"},{"startTime":1782925238069,"executionIndex":0,"source":"25","hints":"26","executionTime":0,"executionStatus":"27","data":"28"},{"startTime":1782925238070,"executionIndex":1,"source":"29","hints":"30","executionTime":221,"executionStatus":"27","data":"31"},{"startTime":1782925238291,"executionIndex":2,"source":"32","hints":"33","executionTime":0,"executionStatus":"27","data":"34"},"Schedule Trigger","n8n-nodes-base.scheduleTrigger","workflow",[],[],"success",{"main":"35"},["36"],[],{"main":"37"},["38"],[],{"main":"39"},["40"],{"previousNode":"22","previousNodeOutput":0,"previousNodeRun":0},["41"],{"previousNode":"42","previousNodeOutput":0,"previousNodeRun":0},["43"],["44"],["45"],"HTTP Request",[],{"json":"46","pairedItem":"47"},{"json":"48","pairedItem":"49"},{"timestamp":"50","Readable date":"51","Readable time":"52","Day of week":"53","Year":"54","Month":"55","Day of month":"56","Hour":"57","Minute":"57","Second":"58","Timezone":"59"},{"item":0},{"count":0,"items":"60"},{"item":0},"2026-07-02T00:00:38.032+07:00","July 2nd 2026, 12:00:38 am","12:00:38 am","Thursday","2026","July","02","00","38","Asia/Bangkok (UTC+07:00)",[]]	958f9d58-aa29-4953-914f-a5f61de89b26
47	{"id":"Si28JZdUotdLzill","name":"content post","nodes":[{"parameters":{"notice":"","rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"curlImport":"","method":"GET","url":"http://app:3000/api/content/scheduled","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":false,"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"fieldToSplitOut":"items","include":"noOtherFields","options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"},{"parameters":{"curlImport":"","method":"PATCH","url":"=\\t http://app:3000/api/content/{{ $json.id }}","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":true,"contentType":"json","specifyBody":"keypair","bodyParameters":{"parameters":[{"name":"status","value":"posted"}]},"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[672,0],"id":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","name":"HTTP Request1"}],"connections":{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]},"Split Out":{"main":[[{"node":"HTTP Request1","type":"main","index":0}]]}},"settings":{"executionOrder":"v1","binaryMode":"separate","availableInMCP":false}}	[{"version":1,"startData":"1","resultData":"2","executionData":"3","resumeToken":"4"},{},{"runData":"5","lastNodeExecuted":"6"},{"contextData":"7","nodeExecutionStack":"8","metadata":"9","waitingExecution":"10","waitingExecutionSource":"11","runtimeData":"12"},"f8d3331832f50f21a4ad2fc98750bea98c48f788beb7312d3db7d74963a4a666",{"Schedule Trigger":"13","HTTP Request":"14","Split Out":"15"},"Split Out",{},[],{},{},{},{"version":1,"establishedAt":1782926138037,"source":"16","triggerNode":"17","redaction":"18"},["19"],["20"],["21"],"trigger",{"name":"22","type":"23"},{"version":2,"production":false,"manual":false,"source":"24"},{"startTime":1782926138071,"executionIndex":0,"source":"25","hints":"26","executionTime":1,"executionStatus":"27","data":"28"},{"startTime":1782926138072,"executionIndex":1,"source":"29","hints":"30","executionTime":315,"executionStatus":"27","data":"31"},{"startTime":1782926138387,"executionIndex":2,"source":"32","hints":"33","executionTime":0,"executionStatus":"27","data":"34"},"Schedule Trigger","n8n-nodes-base.scheduleTrigger","workflow",[],[],"success",{"main":"35"},["36"],[],{"main":"37"},["38"],[],{"main":"39"},["40"],{"previousNode":"22","previousNodeOutput":0,"previousNodeRun":0},["41"],{"previousNode":"42","previousNodeOutput":0,"previousNodeRun":0},["43"],["44"],["45"],"HTTP Request",[],{"json":"46","pairedItem":"47"},{"json":"48","pairedItem":"49"},{"timestamp":"50","Readable date":"51","Readable time":"52","Day of week":"53","Year":"54","Month":"55","Day of month":"56","Hour":"57","Minute":"58","Second":"59","Timezone":"60"},{"item":0},{"count":0,"items":"61"},{"item":0},"2026-07-02T00:15:38.036+07:00","July 2nd 2026, 12:15:38 am","12:15:38 am","Thursday","2026","July","02","00","15","38","Asia/Bangkok (UTC+07:00)",[]]	958f9d58-aa29-4953-914f-a5f61de89b26
48	{"id":"Si28JZdUotdLzill","name":"content post","nodes":[{"parameters":{"notice":"","rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"curlImport":"","method":"GET","url":"http://app:3000/api/content/scheduled","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":false,"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"fieldToSplitOut":"items","include":"noOtherFields","options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"},{"parameters":{"curlImport":"","method":"PATCH","url":"=\\t http://app:3000/api/content/{{ $json.id }}","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":true,"contentType":"json","specifyBody":"keypair","bodyParameters":{"parameters":[{"name":"status","value":"posted"}]},"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[672,0],"id":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","name":"HTTP Request1"}],"connections":{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]},"Split Out":{"main":[[{"node":"HTTP Request1","type":"main","index":0}]]}},"settings":{"executionOrder":"v1","binaryMode":"separate","availableInMCP":false}}	[{"version":1,"startData":"1","resultData":"2","executionData":"3","resumeToken":"4"},{},{"runData":"5","lastNodeExecuted":"6"},{"contextData":"7","nodeExecutionStack":"8","metadata":"9","waitingExecution":"10","waitingExecutionSource":"11","runtimeData":"12"},"ee21940a0b24645cf3ababe76033837e43afbfa8bacf6c986ec1aebe62bc0443",{"Schedule Trigger":"13","HTTP Request":"14","Split Out":"15","HTTP Request1":"16"},"HTTP Request1",{},[],{},{},{},{"version":1,"establishedAt":1782931538043,"source":"17","triggerNode":"18","redaction":"19"},["20"],["21"],["22"],["23"],"trigger",{"name":"24","type":"25"},{"version":2,"production":false,"manual":false,"source":"26"},{"startTime":1782931538087,"executionIndex":0,"source":"27","hints":"28","executionTime":0,"executionStatus":"29","data":"30"},{"startTime":1782931538088,"executionIndex":1,"source":"31","hints":"32","executionTime":431,"executionStatus":"29","data":"33"},{"startTime":1782931538519,"executionIndex":2,"source":"34","hints":"35","executionTime":1,"executionStatus":"29","data":"36"},{"startTime":1782931538520,"executionIndex":3,"source":"37","hints":"38","executionTime":526,"executionStatus":"29","data":"39"},"Schedule Trigger","n8n-nodes-base.scheduleTrigger","workflow",[],[],"success",{"main":"40"},["41"],[],{"main":"42"},["43"],[],{"main":"44"},["45"],[],{"main":"46"},["47"],{"previousNode":"24","previousNodeOutput":0,"previousNodeRun":0},["48"],{"previousNode":"49","previousNodeOutput":0,"previousNodeRun":0},["50"],{"previousNode":"51","previousNodeOutput":0,"previousNodeRun":0},["52"],["53"],["54"],"HTTP Request",["55"],"Split Out",["56"],{"json":"57","pairedItem":"58"},{"json":"59","pairedItem":"60"},{"json":"61","pairedItem":"62"},{"json":"63","pairedItem":"64"},{"timestamp":"65","Readable date":"66","Readable time":"67","Day of week":"68","Year":"69","Month":"70","Day of month":"71","Hour":"72","Minute":"73","Second":"74","Timezone":"75"},{"item":0},{"count":1,"items":"76"},{"item":0},{"id":"77","contentId":"78","name":"79","mediaType":"80","channel":"81","platforms":"82","details":"81","location":"83","scheduledDate":"84","scheduledTime":"85","endTime":"86","team":"87","productsNeeded":"88","itemsToPrepare":"81","attachments":"89","script":"90","ideaCreator":"81","photographer":"81","editor":"81","approver":"91","status":"92","category":"81","tags":"93","createdAt":"94"},{"item":0},{"id":"77","contentId":"78","name":"79","mediaType":"80","channel":"81","platforms":"95","details":"81","location":"96","scheduledDate":"84","scheduledTime":"85","endTime":"86","team":"97","productsNeeded":"98","itemsToPrepare":"81","attachments":"99","script":"100","ideaCreator":"81","photographer":"81","editor":"81","approver":"91","status":"101","category":"81","tags":"102","createdAt":"94"},{"item":0},"2026-07-02T01:45:38.035+07:00","July 2nd 2026, 1:45:38 am","1:45:38 am","Thursday","2026","July","02","01","45","38","Asia/Bangkok (UTC+07:00)",["103"],"cmr2b23hj0003qp6njixegjpl","10922","21 training club","video","",["104","105","106"],[],"2026-07-01","06:46","13:45",[],[],[],[],"Admin","approved",[],"2026-07-01T16:43:59.143Z",["104","105","106"],[],[],[],[],[],"posted",[],{"id":"77","contentId":"78","name":"79","mediaType":"80","channel":"81","platforms":"82","details":"81","location":"83","scheduledDate":"84","scheduledTime":"85","endTime":"86","team":"87","productsNeeded":"88","itemsToPrepare":"81","attachments":"89","script":"90","ideaCreator":"81","photographer":"81","editor":"81","approver":"91","status":"92","category":"81","tags":"93","createdAt":"94"},"tiktok","instagram","line"]	958f9d58-aa29-4953-914f-a5f61de89b26
49	{"id":"Si28JZdUotdLzill","name":"content post","nodes":[{"parameters":{"notice":"","rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"curlImport":"","method":"GET","url":"http://app:3000/api/content/scheduled","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":false,"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"fieldToSplitOut":"items","include":"noOtherFields","options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"},{"parameters":{"curlImport":"","method":"PATCH","url":"=\\t http://app:3000/api/content/{{ $json.id }}","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":true,"contentType":"json","specifyBody":"keypair","bodyParameters":{"parameters":[{"name":"status","value":"posted"}]},"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[672,0],"id":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","name":"HTTP Request1"}],"connections":{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]},"Split Out":{"main":[[{"node":"HTTP Request1","type":"main","index":0}]]}},"settings":{"executionOrder":"v1","binaryMode":"separate","availableInMCP":false}}	[{"version":1,"startData":"1","resultData":"2","executionData":"3","resumeToken":"4"},{},{"runData":"5","lastNodeExecuted":"6"},{"contextData":"7","nodeExecutionStack":"8","metadata":"9","waitingExecution":"10","waitingExecutionSource":"11","runtimeData":"12"},"b736a43650ca96b38d8b1c2ac8925aa971f6195e37b3fef614c671107f9bc2ad",{"Schedule Trigger":"13","HTTP Request":"14","Split Out":"15"},"Split Out",{},[],{},{},{},{"version":1,"establishedAt":1782932438026,"source":"16","triggerNode":"17","redaction":"18"},["19"],["20"],["21"],"trigger",{"name":"22","type":"23"},{"version":2,"production":false,"manual":false,"source":"24"},{"startTime":1782932438051,"executionIndex":0,"source":"25","hints":"26","executionTime":1,"executionStatus":"27","data":"28"},{"startTime":1782932438052,"executionIndex":1,"source":"29","hints":"30","executionTime":151,"executionStatus":"27","data":"31"},{"startTime":1782932438203,"executionIndex":2,"source":"32","hints":"33","executionTime":0,"executionStatus":"27","data":"34"},"Schedule Trigger","n8n-nodes-base.scheduleTrigger","workflow",[],[],"success",{"main":"35"},["36"],[],{"main":"37"},["38"],[],{"main":"39"},["40"],{"previousNode":"22","previousNodeOutput":0,"previousNodeRun":0},["41"],{"previousNode":"42","previousNodeOutput":0,"previousNodeRun":0},["43"],["44"],["45"],"HTTP Request",[],{"json":"46","pairedItem":"47"},{"json":"48","pairedItem":"49"},{"timestamp":"50","Readable date":"51","Readable time":"52","Day of week":"53","Year":"54","Month":"55","Day of month":"56","Hour":"56","Minute":"57","Second":"58","Timezone":"59"},{"item":0},{"count":0,"items":"60"},{"item":0},"2026-07-02T02:00:38.024+07:00","July 2nd 2026, 2:00:38 am","2:00:38 am","Thursday","2026","July","02","00","38","Asia/Bangkok (UTC+07:00)",[]]	958f9d58-aa29-4953-914f-a5f61de89b26
50	{"id":"Si28JZdUotdLzill","name":"content post","nodes":[{"parameters":{"notice":"","rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"curlImport":"","method":"GET","url":"http://app:3000/api/content/scheduled","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":false,"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"fieldToSplitOut":"items","include":"noOtherFields","options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"},{"parameters":{"curlImport":"","method":"PATCH","url":"=\\t http://app:3000/api/content/{{ $json.id }}","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":true,"contentType":"json","specifyBody":"keypair","bodyParameters":{"parameters":[{"name":"status","value":"posted"}]},"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[672,0],"id":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","name":"HTTP Request1"}],"connections":{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]},"Split Out":{"main":[[{"node":"HTTP Request1","type":"main","index":0}]]}},"settings":{"executionOrder":"v1","binaryMode":"separate","availableInMCP":false}}	[{"version":1,"startData":"1","resultData":"2","executionData":"3","resumeToken":"4"},{},{"runData":"5","lastNodeExecuted":"6"},{"contextData":"7","nodeExecutionStack":"8","metadata":"9","waitingExecution":"10","waitingExecutionSource":"11","runtimeData":"12"},"7793de32d5b71aa416ac58695aabf2f9762b9a8598dd0a049dfd777239284556",{"Schedule Trigger":"13","HTTP Request":"14","Split Out":"15"},"Split Out",{},[],{},{},{},{"version":1,"establishedAt":1782966123816,"source":"16","triggerNode":"17","redaction":"18"},["19"],["20"],["21"],"trigger",{"name":"22","type":"23"},{"version":2,"production":false,"manual":false,"source":"24"},{"startTime":1782966123995,"executionIndex":0,"source":"25","hints":"26","executionTime":1,"executionStatus":"27","data":"28"},{"startTime":1782966123997,"executionIndex":1,"source":"29","hints":"30","executionTime":209,"executionStatus":"27","data":"31"},{"startTime":1782966124206,"executionIndex":2,"source":"32","hints":"33","executionTime":1,"executionStatus":"27","data":"34"},"Schedule Trigger","n8n-nodes-base.scheduleTrigger","workflow",[],[],"success",{"main":"35"},["36"],[],{"main":"37"},["38"],[],{"main":"39"},["40"],{"previousNode":"22","previousNodeOutput":0,"previousNodeRun":0},["41"],{"previousNode":"42","previousNodeOutput":0,"previousNodeRun":0},["43"],["44"],["45"],"HTTP Request",[],{"json":"46","pairedItem":"47"},{"json":"48","pairedItem":"49"},{"timestamp":"50","Readable date":"51","Readable time":"52","Day of week":"53","Year":"54","Month":"55","Day of month":"56","Hour":"57","Minute":"58","Second":"59","Timezone":"60"},{"item":0},{"count":0,"items":"61"},{"item":0},"2026-07-02T11:22:03.811+07:00","July 2nd 2026, 11:22:03 am","11:22:03 am","Thursday","2026","July","02","11","22","03","Asia/Bangkok (UTC+07:00)",[]]	958f9d58-aa29-4953-914f-a5f61de89b26
51	{"id":"Si28JZdUotdLzill","name":"content post","nodes":[{"parameters":{"notice":"","rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"curlImport":"","method":"GET","url":"http://app:3000/api/content/scheduled","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":false,"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"fieldToSplitOut":"items","include":"noOtherFields","options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"},{"parameters":{"curlImport":"","method":"PATCH","url":"=\\t http://app:3000/api/content/{{ $json.id }}","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":true,"contentType":"json","specifyBody":"keypair","bodyParameters":{"parameters":[{"name":"status","value":"posted"}]},"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[672,0],"id":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","name":"HTTP Request1"}],"connections":{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]},"Split Out":{"main":[[{"node":"HTTP Request1","type":"main","index":0}]]}},"settings":{"executionOrder":"v1","binaryMode":"separate","availableInMCP":false}}	[{"version":1,"startData":"1","resultData":"2","executionData":"3","resumeToken":"4"},{},{"runData":"5","lastNodeExecuted":"6"},{"contextData":"7","nodeExecutionStack":"8","metadata":"9","waitingExecution":"10","waitingExecutionSource":"11","runtimeData":"12"},"fff68fd85a2c399731d6ee7ff4eba269be4b2c1c3c1a1a8d5a5bdd31b15dfb9a",{"Schedule Trigger":"13","HTTP Request":"14","Split Out":"15"},"Split Out",{},[],{},{},{},{"version":1,"establishedAt":1782966638041,"source":"16","triggerNode":"17","redaction":"18"},["19"],["20"],["21"],"trigger",{"name":"22","type":"23"},{"version":2,"production":false,"manual":false,"source":"24"},{"startTime":1782966638074,"executionIndex":0,"source":"25","hints":"26","executionTime":0,"executionStatus":"27","data":"28"},{"startTime":1782966638075,"executionIndex":1,"source":"29","hints":"30","executionTime":303,"executionStatus":"27","data":"31"},{"startTime":1782966638378,"executionIndex":2,"source":"32","hints":"33","executionTime":0,"executionStatus":"27","data":"34"},"Schedule Trigger","n8n-nodes-base.scheduleTrigger","workflow",[],[],"success",{"main":"35"},["36"],[],{"main":"37"},["38"],[],{"main":"39"},["40"],{"previousNode":"22","previousNodeOutput":0,"previousNodeRun":0},["41"],{"previousNode":"42","previousNodeOutput":0,"previousNodeRun":0},["43"],["44"],["45"],"HTTP Request",[],{"json":"46","pairedItem":"47"},{"json":"48","pairedItem":"49"},{"timestamp":"50","Readable date":"51","Readable time":"52","Day of week":"53","Year":"54","Month":"55","Day of month":"56","Hour":"57","Minute":"58","Second":"59","Timezone":"60"},{"item":0},{"count":0,"items":"61"},{"item":0},"2026-07-02T11:30:38.037+07:00","July 2nd 2026, 11:30:38 am","11:30:38 am","Thursday","2026","July","02","11","30","38","Asia/Bangkok (UTC+07:00)",[]]	958f9d58-aa29-4953-914f-a5f61de89b26
52	{"id":"Si28JZdUotdLzill","name":"content post","nodes":[{"parameters":{"notice":"","rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"curlImport":"","method":"GET","url":"http://app:3000/api/content/scheduled","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":false,"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"fieldToSplitOut":"items","include":"noOtherFields","options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"},{"parameters":{"curlImport":"","method":"PATCH","url":"=\\t http://app:3000/api/content/{{ $json.id }}","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":true,"contentType":"json","specifyBody":"keypair","bodyParameters":{"parameters":[{"name":"status","value":"posted"}]},"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[672,0],"id":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","name":"HTTP Request1"}],"connections":{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]},"Split Out":{"main":[[{"node":"HTTP Request1","type":"main","index":0}]]}},"settings":{"executionOrder":"v1","binaryMode":"separate","availableInMCP":false}}	[{"version":1,"startData":"1","resultData":"2","executionData":"3","resumeToken":"4"},{},{"runData":"5","lastNodeExecuted":"6"},{"contextData":"7","nodeExecutionStack":"8","metadata":"9","waitingExecution":"10","waitingExecutionSource":"11","runtimeData":"12"},"f5cecc7847583495a9fd822ed80c786d27aa187a3f75f4db4719eaf6279f41b6",{"Schedule Trigger":"13","HTTP Request":"14","Split Out":"15"},"Split Out",{},[],{},{},{},{"version":1,"establishedAt":1782967538026,"source":"16","triggerNode":"17","redaction":"18"},["19"],["20"],["21"],"trigger",{"name":"22","type":"23"},{"version":2,"production":false,"manual":false,"source":"24"},{"startTime":1782967538071,"executionIndex":0,"source":"25","hints":"26","executionTime":0,"executionStatus":"27","data":"28"},{"startTime":1782967538071,"executionIndex":1,"source":"29","hints":"30","executionTime":68,"executionStatus":"27","data":"31"},{"startTime":1782967538139,"executionIndex":2,"source":"32","hints":"33","executionTime":0,"executionStatus":"27","data":"34"},"Schedule Trigger","n8n-nodes-base.scheduleTrigger","workflow",[],[],"success",{"main":"35"},["36"],[],{"main":"37"},["38"],[],{"main":"39"},["40"],{"previousNode":"22","previousNodeOutput":0,"previousNodeRun":0},["41"],{"previousNode":"42","previousNodeOutput":0,"previousNodeRun":0},["43"],["44"],["45"],"HTTP Request",[],{"json":"46","pairedItem":"47"},{"json":"48","pairedItem":"49"},{"timestamp":"50","Readable date":"51","Readable time":"52","Day of week":"53","Year":"54","Month":"55","Day of month":"56","Hour":"57","Minute":"58","Second":"59","Timezone":"60"},{"item":0},{"count":0,"items":"61"},{"item":0},"2026-07-02T11:45:38.024+07:00","July 2nd 2026, 11:45:38 am","11:45:38 am","Thursday","2026","July","02","11","45","38","Asia/Bangkok (UTC+07:00)",[]]	958f9d58-aa29-4953-914f-a5f61de89b26
53	{"id":"Si28JZdUotdLzill","name":"content post","nodes":[{"parameters":{"notice":"","rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"curlImport":"","method":"GET","url":"http://app:3000/api/content/scheduled","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":false,"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"fieldToSplitOut":"items","include":"noOtherFields","options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"},{"parameters":{"curlImport":"","method":"PATCH","url":"=\\t http://app:3000/api/content/{{ $json.id }}","authentication":"none","provideSslCertificates":false,"sendQuery":false,"sendHeaders":true,"specifyHeaders":"keypair","headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":true,"contentType":"json","specifyBody":"keypair","bodyParameters":{"parameters":[{"name":"status","value":"posted"}]},"options":{},"infoMessage":""},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[672,0],"id":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","name":"HTTP Request1"}],"connections":{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]},"Split Out":{"main":[[{"node":"HTTP Request1","type":"main","index":0}]]}},"settings":{"executionOrder":"v1","binaryMode":"separate","availableInMCP":false}}	[{"version":1,"startData":"1","resultData":"2","executionData":"3","resumeToken":"4"},{},{"runData":"5","lastNodeExecuted":"6"},{"contextData":"7","nodeExecutionStack":"8","metadata":"9","waitingExecution":"10","waitingExecutionSource":"11","runtimeData":"12"},"7294215748180fd0793f7822ecacf855eac28a7844f7342553acf613f372d70b",{"Schedule Trigger":"13","HTTP Request":"14","Split Out":"15"},"Split Out",{},[],{},{},{},{"version":1,"establishedAt":1782968438025,"source":"16","triggerNode":"17","redaction":"18"},["19"],["20"],["21"],"trigger",{"name":"22","type":"23"},{"version":2,"production":false,"manual":false,"source":"24"},{"startTime":1782968438054,"executionIndex":0,"source":"25","hints":"26","executionTime":0,"executionStatus":"27","data":"28"},{"startTime":1782968438055,"executionIndex":1,"source":"29","hints":"30","executionTime":57,"executionStatus":"27","data":"31"},{"startTime":1782968438112,"executionIndex":2,"source":"32","hints":"33","executionTime":0,"executionStatus":"27","data":"34"},"Schedule Trigger","n8n-nodes-base.scheduleTrigger","workflow",[],[],"success",{"main":"35"},["36"],[],{"main":"37"},["38"],[],{"main":"39"},["40"],{"previousNode":"22","previousNodeOutput":0,"previousNodeRun":0},["41"],{"previousNode":"42","previousNodeOutput":0,"previousNodeRun":0},["43"],["44"],["45"],"HTTP Request",[],{"json":"46","pairedItem":"47"},{"json":"48","pairedItem":"49"},{"timestamp":"50","Readable date":"51","Readable time":"52","Day of week":"53","Year":"54","Month":"55","Day of month":"56","Hour":"57","Minute":"58","Second":"59","Timezone":"60"},{"item":0},{"count":0,"items":"61"},{"item":0},"2026-07-02T12:00:38.022+07:00","July 2nd 2026, 12:00:38 pm","12:00:38 pm","Thursday","2026","July","02","12","00","38","Asia/Bangkok (UTC+07:00)",[]]	958f9d58-aa29-4953-914f-a5f61de89b26
\.


--
-- Data for Name: execution_entity; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.execution_entity (id, finished, mode, "retryOf", "retrySuccessId", "startedAt", "stoppedAt", "waitTill", status, "workflowId", "deletedAt", "createdAt", "storedAt", "tracingContext", "deduplicationKey", "jsonSizeBytes", "workflowVersionId", "binaryDataSizeBytes") FROM stdin;
8	f	manual	\N	\N	2026-07-01 08:15:52.734+00	2026-07-01 08:15:54.202+00	\N	error	Si28JZdUotdLzill	\N	2026-07-01 08:15:52.727+00	db	\N	\N	11156	958f9d58-aa29-4953-914f-a5f61de89b26	0
1	t	manual	\N	\N	2026-06-30 16:45:22.633+00	2026-06-30 16:45:22.665+00	\N	success	Si28JZdUotdLzill	\N	2026-06-30 16:45:22.622+00	db	\N	\N	2337	c8bb8017-a4a4-40e5-98a5-468bf5645db5	0
29	f	trigger	\N	\N	2026-07-01 12:45:38.063+00	2026-07-01 12:45:38.105+00	\N	error	Si28JZdUotdLzill	\N	2026-07-01 12:45:38.047+00	db	\N	Si28JZdUotdLzill:4d97a057-af28-44e3-811e-73245c7bad6f:2026-07-01T12:45:38.000Z	6952	958f9d58-aa29-4953-914f-a5f61de89b26	0
28	f	trigger	\N	\N	2026-07-01 12:30:38.069+00	2026-07-01 12:30:38.136+00	\N	error	Si28JZdUotdLzill	\N	2026-07-01 12:30:38.055+00	db	\N	Si28JZdUotdLzill:4d97a057-af28-44e3-811e-73245c7bad6f:2026-07-01T12:30:38.000Z	6952	958f9d58-aa29-4953-914f-a5f61de89b26	0
2	t	manual	\N	\N	2026-06-30 16:47:55.703+00	2026-06-30 16:47:55.721+00	\N	success	Si28JZdUotdLzill	\N	2026-06-30 16:47:55.695+00	db	\N	\N	2175	660e326a-406d-4cd3-b3a7-1c32f2770569	0
3	t	manual	\N	\N	2026-06-30 16:47:58.441+00	2026-06-30 16:47:58.459+00	\N	success	Si28JZdUotdLzill	\N	2026-06-30 16:47:58.432+00	db	\N	\N	2175	660e326a-406d-4cd3-b3a7-1c32f2770569	0
9	f	manual	\N	\N	2026-07-01 08:16:06.286+00	2026-07-01 08:16:06.352+00	\N	error	Si28JZdUotdLzill	\N	2026-07-01 08:16:06.275+00	db	\N	\N	11121	958f9d58-aa29-4953-914f-a5f61de89b26	0
4	t	manual	\N	\N	2026-07-01 07:51:45.393+00	2026-07-01 07:51:45.47+00	\N	success	Si28JZdUotdLzill	\N	2026-07-01 07:51:45.384+00	db	\N	\N	4550	9ab8985d-247a-4665-a8d7-7336c8564203	0
30	f	trigger	\N	\N	2026-07-01 13:00:38.058+00	2026-07-01 13:00:38.129+00	\N	error	Si28JZdUotdLzill	\N	2026-07-01 13:00:38.04+00	db	\N	Si28JZdUotdLzill:4d97a057-af28-44e3-811e-73245c7bad6f:2026-07-01T13:00:38.000Z	6952	958f9d58-aa29-4953-914f-a5f61de89b26	0
5	t	manual	\N	\N	2026-07-01 08:00:27.655+00	2026-07-01 08:00:27.674+00	\N	success	Si28JZdUotdLzill	\N	2026-07-01 08:00:27.64+00	db	\N	\N	5480	fff4720b-dc3e-4720-b007-6182d7823b5f	0
31	f	trigger	\N	\N	2026-07-01 13:15:38.065+00	2026-07-01 13:15:38.121+00	\N	error	Si28JZdUotdLzill	\N	2026-07-01 13:15:38.048+00	db	\N	Si28JZdUotdLzill:4d97a057-af28-44e3-811e-73245c7bad6f:2026-07-01T13:15:38.000Z	6952	958f9d58-aa29-4953-914f-a5f61de89b26	0
6	f	manual	\N	\N	2026-07-01 08:08:15.993+00	2026-07-01 08:08:16.085+00	\N	error	Si28JZdUotdLzill	\N	2026-07-01 08:08:15.983+00	db	\N	\N	10650	958f9d58-aa29-4953-914f-a5f61de89b26	0
32	f	trigger	\N	\N	2026-07-01 13:30:38.049+00	2026-07-01 13:30:38.132+00	\N	error	Si28JZdUotdLzill	\N	2026-07-01 13:30:38.029+00	db	\N	Si28JZdUotdLzill:4d97a057-af28-44e3-811e-73245c7bad6f:2026-07-01T13:30:38.000Z	6952	958f9d58-aa29-4953-914f-a5f61de89b26	0
10	t	manual	\N	\N	2026-07-01 08:18:19.488+00	2026-07-01 08:18:19.526+00	\N	success	Si28JZdUotdLzill	\N	2026-07-01 08:18:19.484+00	db	\N	\N	5531	958f9d58-aa29-4953-914f-a5f61de89b26	0
7	f	manual	\N	\N	2026-07-01 08:15:35.972+00	2026-07-01 08:15:36.028+00	\N	error	Si28JZdUotdLzill	\N	2026-07-01 08:15:35.962+00	db	\N	\N	14131	958f9d58-aa29-4953-914f-a5f61de89b26	0
14	t	trigger	\N	\N	2026-07-01 09:00:38.055+00	2026-07-01 09:00:38.143+00	\N	success	Si28JZdUotdLzill	\N	2026-07-01 09:00:38.042+00	db	\N	Si28JZdUotdLzill:4d97a057-af28-44e3-811e-73245c7bad6f:2026-07-01T09:00:38.000Z	3777	958f9d58-aa29-4953-914f-a5f61de89b26	0
33	f	trigger	\N	\N	2026-07-01 13:45:38.05+00	2026-07-01 13:45:38.128+00	\N	error	Si28JZdUotdLzill	\N	2026-07-01 13:45:38.032+00	db	\N	Si28JZdUotdLzill:4d97a057-af28-44e3-811e-73245c7bad6f:2026-07-01T13:45:38.000Z	6952	958f9d58-aa29-4953-914f-a5f61de89b26	0
11	t	manual	\N	\N	2026-07-01 08:18:29.421+00	2026-07-01 08:18:30.032+00	\N	success	Si28JZdUotdLzill	\N	2026-07-01 08:18:29.408+00	db	\N	\N	7213	958f9d58-aa29-4953-914f-a5f61de89b26	0
17	t	trigger	\N	\N	2026-07-01 09:45:38.068+00	2026-07-01 09:45:39.548+00	\N	success	Si28JZdUotdLzill	\N	2026-07-01 09:45:38.048+00	db	\N	Si28JZdUotdLzill:4d97a057-af28-44e3-811e-73245c7bad6f:2026-07-01T09:45:38.000Z	3779	958f9d58-aa29-4953-914f-a5f61de89b26	0
12	t	trigger	\N	\N	2026-07-01 08:30:38.05+00	2026-07-01 08:30:38.341+00	\N	success	Si28JZdUotdLzill	\N	2026-07-01 08:30:38.039+00	db	\N	Si28JZdUotdLzill:4d97a057-af28-44e3-811e-73245c7bad6f:2026-07-01T08:30:38.000Z	3778	958f9d58-aa29-4953-914f-a5f61de89b26	0
13	t	trigger	\N	\N	2026-07-01 08:45:38.06+00	2026-07-01 08:45:38.282+00	\N	success	Si28JZdUotdLzill	\N	2026-07-01 08:45:38.041+00	db	\N	Si28JZdUotdLzill:4d97a057-af28-44e3-811e-73245c7bad6f:2026-07-01T08:45:38.000Z	3778	958f9d58-aa29-4953-914f-a5f61de89b26	0
15	t	trigger	\N	\N	2026-07-01 09:15:38.056+00	2026-07-01 09:15:38.356+00	\N	success	Si28JZdUotdLzill	\N	2026-07-01 09:15:38.039+00	db	\N	Si28JZdUotdLzill:4d97a057-af28-44e3-811e-73245c7bad6f:2026-07-01T09:15:38.000Z	3778	958f9d58-aa29-4953-914f-a5f61de89b26	0
16	t	trigger	\N	\N	2026-07-01 09:30:38.059+00	2026-07-01 09:30:38.969+00	\N	success	Si28JZdUotdLzill	\N	2026-07-01 09:30:38.031+00	db	\N	Si28JZdUotdLzill:4d97a057-af28-44e3-811e-73245c7bad6f:2026-07-01T09:30:38.000Z	9638	958f9d58-aa29-4953-914f-a5f61de89b26	0
18	t	trigger	\N	\N	2026-07-01 10:00:38.067+00	2026-07-01 10:00:38.296+00	\N	success	Si28JZdUotdLzill	\N	2026-07-01 10:00:38.051+00	db	\N	Si28JZdUotdLzill:4d97a057-af28-44e3-811e-73245c7bad6f:2026-07-01T10:00:38.000Z	3778	958f9d58-aa29-4953-914f-a5f61de89b26	0
20	t	trigger	\N	\N	2026-07-01 10:30:38.062+00	2026-07-01 10:30:38.391+00	\N	success	Si28JZdUotdLzill	\N	2026-07-01 10:30:38.041+00	db	\N	Si28JZdUotdLzill:4d97a057-af28-44e3-811e-73245c7bad6f:2026-07-01T10:30:38.000Z	3778	958f9d58-aa29-4953-914f-a5f61de89b26	0
19	t	trigger	\N	\N	2026-07-01 10:15:38.042+00	2026-07-01 10:15:38.288+00	\N	success	Si28JZdUotdLzill	\N	2026-07-01 10:15:38.024+00	db	\N	Si28JZdUotdLzill:4d97a057-af28-44e3-811e-73245c7bad6f:2026-07-01T10:15:38.000Z	3778	958f9d58-aa29-4953-914f-a5f61de89b26	0
22	f	trigger	\N	\N	2026-07-01 11:00:38.06+00	2026-07-01 11:00:38.123+00	\N	error	Si28JZdUotdLzill	\N	2026-07-01 11:00:38.044+00	db	\N	Si28JZdUotdLzill:4d97a057-af28-44e3-811e-73245c7bad6f:2026-07-01T11:00:38.000Z	6952	958f9d58-aa29-4953-914f-a5f61de89b26	0
21	f	trigger	\N	\N	2026-07-01 10:45:38.087+00	2026-07-01 10:45:38.283+00	\N	error	Si28JZdUotdLzill	\N	2026-07-01 10:45:38.066+00	db	\N	Si28JZdUotdLzill:4d97a057-af28-44e3-811e-73245c7bad6f:2026-07-01T10:45:38.000Z	6953	958f9d58-aa29-4953-914f-a5f61de89b26	0
25	f	trigger	\N	\N	2026-07-01 11:45:38.073+00	2026-07-01 11:45:38.141+00	\N	error	Si28JZdUotdLzill	\N	2026-07-01 11:45:38.055+00	db	\N	Si28JZdUotdLzill:4d97a057-af28-44e3-811e-73245c7bad6f:2026-07-01T11:45:38.000Z	6952	958f9d58-aa29-4953-914f-a5f61de89b26	0
23	f	trigger	\N	\N	2026-07-01 11:15:38.073+00	2026-07-01 11:15:38.387+00	\N	error	Si28JZdUotdLzill	\N	2026-07-01 11:15:38.061+00	db	\N	Si28JZdUotdLzill:4d97a057-af28-44e3-811e-73245c7bad6f:2026-07-01T11:15:38.000Z	6953	958f9d58-aa29-4953-914f-a5f61de89b26	0
24	f	trigger	\N	\N	2026-07-01 11:30:38.065+00	2026-07-01 11:30:38.111+00	\N	error	Si28JZdUotdLzill	\N	2026-07-01 11:30:38.05+00	db	\N	Si28JZdUotdLzill:4d97a057-af28-44e3-811e-73245c7bad6f:2026-07-01T11:30:38.000Z	6952	958f9d58-aa29-4953-914f-a5f61de89b26	0
26	f	trigger	\N	\N	2026-07-01 12:00:38.048+00	2026-07-01 12:00:38.128+00	\N	error	Si28JZdUotdLzill	\N	2026-07-01 12:00:38.03+00	db	\N	Si28JZdUotdLzill:4d97a057-af28-44e3-811e-73245c7bad6f:2026-07-01T12:00:38.000Z	6952	958f9d58-aa29-4953-914f-a5f61de89b26	0
27	f	trigger	\N	\N	2026-07-01 12:15:38.049+00	2026-07-01 12:15:38.134+00	\N	error	Si28JZdUotdLzill	\N	2026-07-01 12:15:38.031+00	db	\N	Si28JZdUotdLzill:4d97a057-af28-44e3-811e-73245c7bad6f:2026-07-01T12:15:38.000Z	6952	958f9d58-aa29-4953-914f-a5f61de89b26	0
34	f	trigger	\N	\N	2026-07-01 14:00:38.053+00	2026-07-01 14:00:38.132+00	\N	error	Si28JZdUotdLzill	\N	2026-07-01 14:00:38.038+00	db	\N	Si28JZdUotdLzill:4d97a057-af28-44e3-811e-73245c7bad6f:2026-07-01T14:00:38.000Z	6952	958f9d58-aa29-4953-914f-a5f61de89b26	0
35	f	trigger	\N	\N	2026-07-01 14:15:38.061+00	2026-07-01 14:15:38.126+00	\N	error	Si28JZdUotdLzill	\N	2026-07-01 14:15:38.044+00	db	\N	Si28JZdUotdLzill:4d97a057-af28-44e3-811e-73245c7bad6f:2026-07-01T14:15:38.000Z	6952	958f9d58-aa29-4953-914f-a5f61de89b26	0
36	f	trigger	\N	\N	2026-07-01 14:30:38.05+00	2026-07-01 14:30:38.119+00	\N	error	Si28JZdUotdLzill	\N	2026-07-01 14:30:38.033+00	db	\N	Si28JZdUotdLzill:4d97a057-af28-44e3-811e-73245c7bad6f:2026-07-01T14:30:38.000Z	6952	958f9d58-aa29-4953-914f-a5f61de89b26	0
40	f	trigger	\N	\N	2026-07-01 15:30:38.074+00	2026-07-01 15:30:38.127+00	\N	error	Si28JZdUotdLzill	\N	2026-07-01 15:30:38.06+00	db	\N	Si28JZdUotdLzill:4d97a057-af28-44e3-811e-73245c7bad6f:2026-07-01T15:30:38.000Z	6954	958f9d58-aa29-4953-914f-a5f61de89b26	0
37	f	trigger	\N	\N	2026-07-01 14:45:38.07+00	2026-07-01 14:45:38.23+00	\N	error	Si28JZdUotdLzill	\N	2026-07-01 14:45:38.049+00	db	\N	Si28JZdUotdLzill:4d97a057-af28-44e3-811e-73245c7bad6f:2026-07-01T14:45:38.000Z	6953	958f9d58-aa29-4953-914f-a5f61de89b26	0
38	f	trigger	\N	\N	2026-07-01 15:01:07.144+00	2026-07-01 15:01:07.363+00	\N	error	Si28JZdUotdLzill	\N	2026-07-01 15:01:07.127+00	db	\N	Si28JZdUotdLzill:4d97a057-af28-44e3-811e-73245c7bad6f:2026-07-01T15:00:38.000Z	6950	958f9d58-aa29-4953-914f-a5f61de89b26	0
39	f	trigger	\N	\N	2026-07-01 15:15:38.1+00	2026-07-01 15:15:38.158+00	\N	error	Si28JZdUotdLzill	\N	2026-07-01 15:15:38.064+00	db	\N	Si28JZdUotdLzill:4d97a057-af28-44e3-811e-73245c7bad6f:2026-07-01T15:15:38.000Z	6954	958f9d58-aa29-4953-914f-a5f61de89b26	0
41	f	trigger	\N	\N	2026-07-01 15:45:38.08+00	2026-07-01 15:45:38.144+00	\N	error	Si28JZdUotdLzill	\N	2026-07-01 15:45:38.067+00	db	\N	Si28JZdUotdLzill:4d97a057-af28-44e3-811e-73245c7bad6f:2026-07-01T15:45:38.000Z	6954	958f9d58-aa29-4953-914f-a5f61de89b26	0
44	f	trigger	\N	\N	2026-07-01 16:30:38.049+00	2026-07-01 16:30:38.123+00	\N	error	Si28JZdUotdLzill	\N	2026-07-01 16:30:38.032+00	db	\N	Si28JZdUotdLzill:4d97a057-af28-44e3-811e-73245c7bad6f:2026-07-01T16:30:38.000Z	6954	958f9d58-aa29-4953-914f-a5f61de89b26	0
42	f	trigger	\N	\N	2026-07-01 16:00:38.068+00	2026-07-01 16:00:38.128+00	\N	error	Si28JZdUotdLzill	\N	2026-07-01 16:00:38.051+00	db	\N	Si28JZdUotdLzill:4d97a057-af28-44e3-811e-73245c7bad6f:2026-07-01T16:00:38.000Z	6954	958f9d58-aa29-4953-914f-a5f61de89b26	0
47	t	trigger	\N	\N	2026-07-01 17:15:38.054+00	2026-07-01 17:15:38.387+00	\N	success	Si28JZdUotdLzill	\N	2026-07-01 17:15:38.039+00	db	\N	Si28JZdUotdLzill:4d97a057-af28-44e3-811e-73245c7bad6f:2026-07-01T17:15:38.000Z	3779	958f9d58-aa29-4953-914f-a5f61de89b26	0
43	f	trigger	\N	\N	2026-07-01 16:15:38.066+00	2026-07-01 16:15:38.12+00	\N	error	Si28JZdUotdLzill	\N	2026-07-01 16:15:38.045+00	db	\N	Si28JZdUotdLzill:4d97a057-af28-44e3-811e-73245c7bad6f:2026-07-01T16:15:38.000Z	6954	958f9d58-aa29-4953-914f-a5f61de89b26	0
45	t	trigger	\N	\N	2026-07-01 16:45:38.058+00	2026-07-01 16:45:38.32+00	\N	success	Si28JZdUotdLzill	\N	2026-07-01 16:45:38.041+00	db	\N	Si28JZdUotdLzill:4d97a057-af28-44e3-811e-73245c7bad6f:2026-07-01T16:45:38.000Z	3780	958f9d58-aa29-4953-914f-a5f61de89b26	0
46	t	trigger	\N	\N	2026-07-01 17:00:38.057+00	2026-07-01 17:00:38.291+00	\N	success	Si28JZdUotdLzill	\N	2026-07-01 17:00:38.039+00	db	\N	Si28JZdUotdLzill:4d97a057-af28-44e3-811e-73245c7bad6f:2026-07-01T17:00:38.000Z	3774	958f9d58-aa29-4953-914f-a5f61de89b26	0
48	t	trigger	\N	\N	2026-07-01 18:45:38.065+00	2026-07-01 18:45:39.047+00	\N	success	Si28JZdUotdLzill	\N	2026-07-01 18:45:38.046+00	db	\N	Si28JZdUotdLzill:4d97a057-af28-44e3-811e-73245c7bad6f:2026-07-01T18:45:38.000Z	5590	958f9d58-aa29-4953-914f-a5f61de89b26	0
50	t	trigger	\N	\N	2026-07-02 04:22:03.947+00	2026-07-02 04:22:04.207+00	\N	success	Si28JZdUotdLzill	\N	2026-07-02 04:22:03.881+00	db	\N	Si28JZdUotdLzill:4d97a057-af28-44e3-811e-73245c7bad6f:2026-07-01T19:15:38.000Z	3779	958f9d58-aa29-4953-914f-a5f61de89b26	0
49	t	trigger	\N	\N	2026-07-01 19:00:38.041+00	2026-07-01 19:00:38.203+00	\N	success	Si28JZdUotdLzill	\N	2026-07-01 19:00:38.027+00	db	\N	Si28JZdUotdLzill:4d97a057-af28-44e3-811e-73245c7bad6f:2026-07-01T19:00:38.000Z	3772	958f9d58-aa29-4953-914f-a5f61de89b26	0
52	t	trigger	\N	\N	2026-07-02 04:45:38.04+00	2026-07-02 04:45:38.139+00	\N	success	Si28JZdUotdLzill	\N	2026-07-02 04:45:38.026+00	db	\N	Si28JZdUotdLzill:4d97a057-af28-44e3-811e-73245c7bad6f:2026-07-02T04:45:38.000Z	3778	958f9d58-aa29-4953-914f-a5f61de89b26	0
51	t	trigger	\N	\N	2026-07-02 04:30:38.061+00	2026-07-02 04:30:38.378+00	\N	success	Si28JZdUotdLzill	\N	2026-07-02 04:30:38.042+00	db	\N	Si28JZdUotdLzill:4d97a057-af28-44e3-811e-73245c7bad6f:2026-07-02T04:30:38.000Z	3779	958f9d58-aa29-4953-914f-a5f61de89b26	0
53	t	trigger	\N	\N	2026-07-02 05:00:38.044+00	2026-07-02 05:00:38.112+00	\N	success	Si28JZdUotdLzill	\N	2026-07-02 05:00:38.026+00	db	\N	Si28JZdUotdLzill:4d97a057-af28-44e3-811e-73245c7bad6f:2026-07-02T05:00:38.000Z	3778	958f9d58-aa29-4953-914f-a5f61de89b26	0
\.


--
-- Data for Name: execution_metadata; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.execution_metadata (id, "executionId", key, value) FROM stdin;
\.


--
-- Data for Name: folder; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.folder (id, name, "parentFolderId", "projectId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: folder_tag; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.folder_tag ("folderId", "tagId") FROM stdin;
\.


--
-- Data for Name: insights_by_period; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.insights_by_period (id, "metaId", type, value, "periodUnit", "periodStart") FROM stdin;
2	1	2	2	0	2026-07-01 08:00:00+00
4	1	0	0	0	2026-07-01 08:00:00+00
5	1	1	491	0	2026-07-01 08:00:00+00
1	1	2	4	0	2026-07-01 09:00:00+00
3	1	0	0	0	2026-07-01 09:00:00+00
6	1	1	2739	0	2026-07-01 09:00:00+00
9	1	0	0	0	2026-07-01 10:00:00+00
10	1	2	3	0	2026-07-01 10:00:00+00
16	1	3	1	0	2026-07-01 10:00:00+00
12	1	1	952	0	2026-07-01 10:00:00+00
13	1	1	449	0	2026-07-01 11:00:00+00
17	1	3	4	0	2026-07-01 11:00:00+00
19	1	1	229	0	2026-07-01 12:00:00+00
21	1	3	4	0	2026-07-01 12:00:00+00
23	1	3	4	0	2026-07-01 13:00:00+00
24	1	1	246	0	2026-07-01 13:00:00+00
27	1	1	324	0	2026-07-01 14:00:00+00
30	1	3	4	0	2026-07-01 14:00:00+00
32	1	3	4	0	2026-07-01 15:00:00+00
33	1	1	366	0	2026-07-01 15:00:00+00
35	1	3	3	0	2026-07-01 16:00:00+00
36	1	1	407	0	2026-07-01 16:00:00+00
44	1	2	1	0	2026-07-01 16:00:00+00
45	1	0	0	0	2026-07-01 16:00:00+00
41	1	1	540	0	2026-07-01 17:00:00+00
47	1	1	153	0	2026-07-01 19:00:00+00
48	1	0	0	0	2026-07-01 19:00:00+00
49	1	2	1	0	2026-07-01 19:00:00+00
42	1	0	0	0	2026-07-01 17:00:00+00
51	1	1	964	0	2026-07-01 18:00:00+00
43	1	2	2	0	2026-07-01 17:00:00+00
53	1	2	1	0	2026-07-01 18:00:00+00
54	1	0	0	0	2026-07-01 18:00:00+00
\.


--
-- Data for Name: insights_metadata; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.insights_metadata ("metaId", "workflowId", "projectId", "workflowName", "projectName") FROM stdin;
1	Si28JZdUotdLzill	QGsFzdGXWFTYynTH	content post	Thatchavit Thaveechaiyagarn <iamthatchavit@gmail.com>
\.


--
-- Data for Name: insights_raw; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.insights_raw (id, "metaId", type, value, "timestamp") FROM stdin;
91	1	2	1	2026-07-02 04:22:04+00
92	1	1	213	2026-07-02 04:22:04+00
93	1	0	0	2026-07-02 04:22:04+00
94	1	2	1	2026-07-02 04:30:38+00
95	1	1	306	2026-07-02 04:30:38+00
96	1	0	0	2026-07-02 04:30:38+00
97	1	2	1	2026-07-02 04:45:38+00
98	1	1	69	2026-07-02 04:45:38+00
99	1	0	0	2026-07-02 04:45:38+00
100	1	2	1	2026-07-02 05:00:38+00
101	1	1	59	2026-07-02 05:00:38+00
102	1	0	0	2026-07-02 05:00:38+00
\.


--
-- Data for Name: installed_nodes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.installed_nodes (name, type, "latestVersion", package) FROM stdin;
\.


--
-- Data for Name: installed_packages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.installed_packages ("packageName", "installedVersion", "authorName", "authorEmail", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: instance_ai_checkpoints; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.instance_ai_checkpoints (key, "runId", "threadId", "resourceId", state, "createdAt", "updatedAt", "expiredAt") FROM stdin;
\.


--
-- Data for Name: instance_ai_iteration_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.instance_ai_iteration_logs (id, "threadId", "taskKey", entry, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: instance_ai_mcp_registry_connections; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.instance_ai_mcp_registry_connections (id, "credentialId", "serverSlug", "toolFilter", "userId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: instance_ai_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.instance_ai_messages (id, "threadId", content, role, type, "resourceId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: instance_ai_observation_cursors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.instance_ai_observation_cursors ("observationScopeId", "lastObservedMessageId", "lastObservedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: instance_ai_observation_locks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.instance_ai_observation_locks ("observationScopeId", "taskKind", "holderId", "heldUntil", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: instance_ai_observational_memory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.instance_ai_observational_memory (id, "lookupKey", scope, "threadId", "resourceId", "activeObservations", "originType", config, "generationCount", "lastObservedAt", "pendingMessageTokens", "totalTokensObserved", "observationTokenCount", "isObserving", "isReflecting", "observedMessageIds", "observedTimezone", "bufferedObservations", "bufferedObservationTokens", "bufferedMessageIds", "bufferedReflection", "bufferedReflectionTokens", "bufferedReflectionInputTokens", "reflectedObservationLineCount", "bufferedObservationChunks", "isBufferingObservation", "isBufferingReflection", "lastBufferedAtTokens", "lastBufferedAtTime", metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: instance_ai_observations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.instance_ai_observations (id, "observationScopeId", marker, text, "parentId", "tokenCount", status, "supersededBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: instance_ai_pending_confirmations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.instance_ai_pending_confirmations ("requestId", "threadId", "userId", kind, "runId", "toolCallId", "messageGroupId", "checkpointKey", "checkpointTaskId", "expiresAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: instance_ai_resources; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.instance_ai_resources (id, "workingMemory", metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: instance_ai_run_snapshots; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.instance_ai_run_snapshots ("threadId", "runId", "messageGroupId", "runIds", tree, "createdAt", "updatedAt", "langsmithRunId", "langsmithTraceId", "traceId", "spanId") FROM stdin;
\.


--
-- Data for Name: instance_ai_thread_grants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.instance_ai_thread_grants ("threadId", "userId", "grantKey", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: instance_ai_threads; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.instance_ai_threads (id, "resourceId", title, metadata, "createdAt", "updatedAt", "projectId") FROM stdin;
\.


--
-- Data for Name: instance_ai_workflow_snapshots; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.instance_ai_workflow_snapshots ("runId", "workflowName", "resourceId", status, snapshot, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: instance_version_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.instance_version_history (id, major, minor, patch, "createdAt") FROM stdin;
1	2	28	3	2026-06-30 16:29:55.781+00
\.


--
-- Data for Name: invalid_auth_token; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invalid_auth_token (token, "expiresAt") FROM stdin;
\.


--
-- Data for Name: mcp_registry_server; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mcp_registry_server (slug, status, version, "registryUpdatedAt", data, "createdAt", "updatedAt") FROM stdin;
notion	active	1.0.1	2026-06-11 19:29:07.703	{"id":1,"name":"com.notion/mcp","title":"Notion","tagline":"Connect to the Notion MCP Server","description":"Official Notion MCP server","websiteUrl":null,"authType":"oauth2","isOfficial":true,"isPublished":true,"origin":"registry","createdAt":"2026-05-19T16:49:13.571Z","publishedAt":"2026-06-18T09:50:05.210Z","remotes":[{"id":1,"type":"streamable-http","url":"https://mcp.notion.com/mcp"},{"id":2,"type":"sse","url":"https://mcp.notion.com/sse"}],"tools":[],"tags":{"data":[]},"extendsCredential":null,"icons":[{"src":"https://n8niostorageaccount.blob.core.windows.net/n8nio-strapi-blobs-prod/assets/idjb_Qg_E_jj_26d71d08b5.svg","mimeType":"image/svg+xml","theme":"dark"},{"src":"https://n8niostorageaccount.blob.core.windows.net/n8nio-strapi-blobs-prod/assets/idjb_Qg_E_jj_5fcfcab5f8.svg","mimeType":"image/svg+xml","theme":"light"}]}	2026-06-30 16:29:56.303+00	2026-06-30 16:29:56.303+00
atlassian	active	1.1.1	2026-06-11 19:28:42.32	{"id":2,"name":"com.atlassian/atlassian-mcp-server","title":"Atlassian","tagline":"Connect to the Atlassian MCP Server","description":"Atlassian Rovo MCP Server","websiteUrl":null,"authType":"oauth2","isOfficial":true,"isPublished":true,"origin":"registry","createdAt":"2026-05-19T16:49:24.904Z","publishedAt":"2026-06-18T09:50:05.210Z","remotes":[{"id":3,"type":"streamable-http","url":"https://mcp.atlassian.com/v1/mcp"},{"id":4,"type":"sse","url":"https://mcp.atlassian.com/v1/sse"}],"tools":[],"tags":{"data":[]},"extendsCredential":null,"icons":[{"src":"https://n8niostorageaccount.blob.core.windows.net/n8nio-strapi-blobs-prod/assets/id_KV_Ejn_Mrk_716d407499.svg","mimeType":"image/svg+xml","theme":"dark"},{"src":"https://n8niostorageaccount.blob.core.windows.net/n8nio-strapi-blobs-prod/assets/id_KV_Ejn_Mrk_1f404ecbfd.svg","mimeType":"image/svg+xml","theme":"light"}]}	2026-06-30 16:29:56.303+00	2026-06-30 16:29:56.303+00
apify	active	0.10.6	2026-06-11 19:28:32.446	{"id":3,"name":"com.apify/apify-mcp-server","title":"Apify","tagline":"Connect to the Apify MCP Server","description":"Extract data from any website with thousands of scrapers, crawlers, and automations on Apify Store ⚡","websiteUrl":null,"authType":"oauth2","isOfficial":true,"isPublished":true,"origin":"registry","createdAt":"2026-05-19T16:49:36.524Z","publishedAt":"2026-06-18T09:50:05.210Z","remotes":[{"id":5,"type":"streamable-http","url":"https://mcp.apify.com/"}],"tools":[],"tags":{"data":[]},"extendsCredential":null,"icons":[{"src":"https://n8niostorageaccount.blob.core.windows.net/n8nio-strapi-blobs-prod/assets/id_S_Uz5c4rz_d01d21b490.svg","mimeType":"image/svg+xml","theme":"dark"},{"src":"https://n8niostorageaccount.blob.core.windows.net/n8nio-strapi-blobs-prod/assets/id6k3_J_n_Mi_ceeccc3a3e.svg","mimeType":"image/svg+xml","theme":"light"}]}	2026-06-30 16:29:56.303+00	2026-06-30 16:29:56.303+00
stripe	active	0.2.4	2026-06-11 19:29:33.086	{"id":4,"name":"com.stripe/mcp","title":"Stripe","tagline":"Connect to the Stripe MCP Server","description":"MCP server integrating with Stripe - tools for customers, products, payments, and more.","websiteUrl":null,"authType":"oauth2","isOfficial":true,"isPublished":true,"origin":"registry","createdAt":"2026-05-19T16:49:47.930Z","publishedAt":"2026-06-18T09:50:05.210Z","remotes":[{"id":6,"type":"streamable-http","url":"https://mcp.stripe.com"}],"tools":[],"tags":{"data":[]},"extendsCredential":null,"icons":[{"src":"https://n8niostorageaccount.blob.core.windows.net/n8nio-strapi-blobs-prod/assets/id_Bn9_1_Njr_e4279db01b.jpeg","mimeType":"image/jpeg","theme":"light"}]}	2026-06-30 16:29:56.303+00	2026-06-30 16:29:56.303+00
monday-com	active	0.0.1	2026-06-11 19:29:02.947	{"id":5,"name":"com.monday/monday.com","title":"monday.com","tagline":"Connect to the monday.com MCP Server","description":"MCP server for monday.com integration.","websiteUrl":null,"authType":"oauth2","isOfficial":true,"isPublished":true,"origin":"registry","createdAt":"2026-05-19T16:49:59.434Z","publishedAt":"2026-06-18T09:50:05.210Z","remotes":[{"id":7,"type":"streamable-http","url":"https://mcp.monday.com/mcp"},{"id":8,"type":"sse","url":"https://mcp.monday.com/sse"}],"tools":[],"tags":{"data":[]},"extendsCredential":null,"icons":[{"src":"https://n8niostorageaccount.blob.core.windows.net/n8nio-strapi-blobs-prod/assets/idz_Vgm_C8_SV_4533eff3c2.svg","mimeType":"image/svg+xml","theme":"light"}]}	2026-06-30 16:29:56.303+00	2026-06-30 16:29:56.303+00
git-lab	active	0.0.1	2026-06-11 19:28:56.391	{"id":6,"name":"com.gitlab/mcp","title":"GitLab","tagline":"Connect to the GitLab MCP Server","description":"Official GitLab MCP Server","websiteUrl":null,"authType":"oauth2","isOfficial":true,"isPublished":true,"origin":"registry","createdAt":"2026-05-19T16:50:10.745Z","publishedAt":"2026-06-18T09:50:05.210Z","remotes":[{"id":9,"type":"streamable-http","url":"https://gitlab.com/api/v4/mcp"}],"tools":[],"tags":{"data":[]},"extendsCredential":null,"icons":[{"src":"https://n8niostorageaccount.blob.core.windows.net/n8nio-strapi-blobs-prod/assets/idkt3_Cw41b_9f7043ad83.svg","mimeType":"image/svg+xml","theme":"dark"},{"src":"https://n8niostorageaccount.blob.core.windows.net/n8nio-strapi-blobs-prod/assets/id_O_Daz_Q_Zbt_f76933a2e6.svg","mimeType":"image/svg+xml","theme":"light"}]}	2026-06-30 16:29:56.303+00	2026-06-30 16:29:56.303+00
linear	active	1.0.0	2026-06-11 19:28:04.979	{"id":7,"name":"app.linear/linear","title":"Linear","tagline":"Connect to the Linear MCP Server","description":"MCP server for Linear project management and issue tracking","websiteUrl":null,"authType":"oauth2","isOfficial":true,"isPublished":true,"origin":"registry","createdAt":"2026-05-19T16:50:22.156Z","publishedAt":"2026-06-18T09:50:05.210Z","remotes":[{"id":11,"type":"sse","url":"https://mcp.linear.app/sse"},{"id":10,"type":"streamable-http","url":"https://mcp.linear.app/mcp"}],"tools":[],"tags":{"data":[]},"extendsCredential":null,"icons":[{"src":"https://n8niostorageaccount.blob.core.windows.net/n8nio-strapi-blobs-prod/assets/id_P3_K9_Q_jj_6b6c66c6c7.svg","mimeType":"image/svg+xml","theme":"dark"},{"src":"https://n8niostorageaccount.blob.core.windows.net/n8nio-strapi-blobs-prod/assets/id_P3_K9_Q_jj_7d409a8856.svg","mimeType":"image/svg+xml","theme":"light"}]}	2026-06-30 16:29:56.303+00	2026-06-30 16:29:56.303+00
webflow	active	2.0.0	2026-06-11 19:29:37.869	{"id":8,"name":"com.webflow/mcp","title":"Webflow","tagline":"Connect to the Webflow MCP Server","description":"AI-powered design and management for Webflow Sites","websiteUrl":null,"authType":"oauth2","isOfficial":true,"isPublished":true,"origin":"registry","createdAt":"2026-05-19T16:50:33.630Z","publishedAt":"2026-06-18T09:50:05.210Z","remotes":[{"id":12,"type":"streamable-http","url":"https://mcp.webflow.com/mcp"}],"tools":[],"tags":{"data":[]},"extendsCredential":null,"icons":[{"src":"https://n8niostorageaccount.blob.core.windows.net/n8nio-strapi-blobs-prod/assets/idx_GYKE_Fj1_b568d3380a.svg","mimeType":"image/svg+xml","theme":"dark"},{"src":"https://n8niostorageaccount.blob.core.windows.net/n8nio-strapi-blobs-prod/assets/id_Zp72_NUI_5_080d2c331c.svg","mimeType":"image/svg+xml","theme":"light"}]}	2026-06-30 16:29:56.303+00	2026-06-30 16:29:56.303+00
pay-pal	active	1.0.0	2026-06-11 19:29:23.307	{"id":9,"name":"com.paypal.mcp/mcp","title":"PayPal","tagline":"Connect to the PayPal MCP Server","description":"PayPal MCP server provides access to PayPal services and operations for AI assistants","websiteUrl":null,"authType":"oauth2","isOfficial":true,"isPublished":true,"origin":"registry","createdAt":"2026-05-19T16:50:45.127Z","publishedAt":"2026-06-18T09:50:05.210Z","remotes":[{"id":13,"type":"streamable-http","url":"https://mcp.paypal.com/mcp"},{"id":14,"type":"sse","url":"https://mcp.paypal.com/sse"}],"tools":[],"tags":{"data":[]},"extendsCredential":null,"icons":[{"src":"https://n8niostorageaccount.blob.core.windows.net/n8nio-strapi-blobs-prod/assets/id_R_Wy_Aj_C_Dz_324a3b0a2e.svg","mimeType":"image/svg+xml","theme":"light"}]}	2026-06-30 16:29:56.303+00	2026-06-30 16:29:56.303+00
post-hog	active	0.2.5	2026-06-11 19:29:53.047	{"id":10,"name":"io.github.PostHog/mcp","title":"PostHog","tagline":"Connect to the PostHog MCP Server","description":"Official PostHog MCP Server for product analytics, feature flags, experiments, and more.","websiteUrl":null,"authType":"oauth2","isOfficial":true,"isPublished":true,"origin":"registry","createdAt":"2026-05-19T16:50:56.421Z","publishedAt":"2026-06-18T09:50:05.210Z","remotes":[{"id":16,"type":"streamable-http","url":"https://mcp.posthog.com/mcp"},{"id":15,"type":"sse","url":"https://mcp.posthog.com/sse"}],"tools":[],"tags":{"data":[]},"extendsCredential":null,"icons":[{"src":"https://n8niostorageaccount.blob.core.windows.net/n8nio-strapi-blobs-prod/assets/id_Yz0_Wt_S_Oc_8e4d0f0070.svg","mimeType":"image/svg+xml","theme":"light"}]}	2026-06-30 16:29:56.303+00	2026-06-30 16:29:56.303+00
amplitude	active	1.0.0	2026-06-11 19:28:25.27	{"id":11,"name":"com.amplitude/mcp-server","title":"Amplitude","tagline":"Connect to the Amplitude MCP Server","description":"Search, access, and get insights on your Amplitude data","websiteUrl":null,"authType":"oauth2","isOfficial":true,"isPublished":true,"origin":"registry","createdAt":"2026-05-19T16:51:08.257Z","publishedAt":"2026-06-18T09:50:05.210Z","remotes":[{"id":17,"type":"streamable-http","url":"https://mcp.amplitude.com/mcp"},{"id":18,"type":"streamable-http","url":"https://mcp.eu.amplitude.com/mcp"}],"tools":[],"tags":{"data":[]},"extendsCredential":null,"icons":[{"src":"https://n8niostorageaccount.blob.core.windows.net/n8nio-strapi-blobs-prod/assets/id_G_Fjvl8_Pa_bd331a64fc.svg","mimeType":"image/svg+xml","theme":"dark"},{"src":"https://n8niostorageaccount.blob.core.windows.net/n8nio-strapi-blobs-prod/assets/id_G_Fjvl8_Pa_a15896d97c.svg","mimeType":"image/svg+xml","theme":"light"}]}	2026-06-30 16:29:56.303+00	2026-06-30 16:29:56.303+00
postman	active	2.8.9	2026-06-11 19:29:28.445	{"id":12,"name":"com.postman/postman-mcp-server","title":"Postman","tagline":"Connect to the Postman MCP Server","description":"A basic MCP server to operate on the Postman API.","websiteUrl":null,"authType":"oauth2","isOfficial":true,"isPublished":true,"origin":"registry","createdAt":"2026-05-19T16:51:20.254Z","publishedAt":"2026-06-18T09:50:05.210Z","remotes":[{"id":19,"type":"streamable-http","url":"https://mcp.postman.com/mcp"},{"id":20,"type":"streamable-http","url":"https://mcp.postman.com/minimal"},{"id":21,"type":"streamable-http","url":"https://mcp.eu.postman.com/mcp"},{"id":22,"type":"streamable-http","url":"https://mcp.eu.postman.com/minimal"}],"tools":[],"tags":{"data":[]},"extendsCredential":null,"icons":[{"src":"https://n8niostorageaccount.blob.core.windows.net/n8nio-strapi-blobs-prod/assets/idr_UU_WRCO_c111cb0dea.png","mimeType":"image/png","theme":"light"}]}	2026-06-30 16:29:56.303+00	2026-06-30 16:29:56.303+00
close	active	1.0.1	2026-06-11 19:28:50.223	{"id":13,"name":"com.close/close-mcp","title":"Close","tagline":"Connect to the Close MCP Server","description":"Close CRM to manage your sales pipeline. Learn more at https://close.com or https://mcp.close.com","websiteUrl":null,"authType":"oauth2","isOfficial":true,"isPublished":true,"origin":"registry","createdAt":"2026-05-19T16:51:32.979Z","publishedAt":"2026-06-18T09:50:05.210Z","remotes":[{"id":23,"type":"streamable-http","url":"https://mcp.close.com/mcp"}],"tools":[],"tags":{"data":[]},"extendsCredential":null,"icons":[{"src":"https://n8niostorageaccount.blob.core.windows.net/n8nio-strapi-blobs-prod/assets/idpghi9sa_C_14d2cba8bf.png","mimeType":"image/png","theme":"light"}]}	2026-06-30 16:29:56.303+00	2026-06-30 16:29:56.303+00
wix	active	1.0.2	2026-06-11 19:29:47.22	{"id":14,"name":"com.wix/mcp","title":"Wix","tagline":"Connect to the Wix MCP Server","description":"A Model Context Protocol server for Wix AI tools","websiteUrl":null,"authType":"oauth2","isOfficial":true,"isPublished":true,"origin":"registry","createdAt":"2026-05-19T16:51:44.311Z","publishedAt":"2026-06-18T09:50:05.210Z","remotes":[{"id":24,"type":"sse","url":"https://mcp.wix.com/sse"},{"id":25,"type":"streamable-http","url":"https://mcp.wix.com/mcp"}],"tools":[],"tags":{"data":[]},"extendsCredential":null,"icons":[{"src":"https://n8niostorageaccount.blob.core.windows.net/n8nio-strapi-blobs-prod/assets/id_Qa_F_Jx_Orc_31d963143f.jpeg","mimeType":"image/jpeg","theme":"light"}]}	2026-06-30 16:29:56.303+00	2026-06-30 16:29:56.303+00
prisma	active	1.0.0	2026-06-11 19:30:05.827	{"id":15,"name":"io.prisma/mcp","title":"Prisma","tagline":"Connect to the Prisma MCP Server","description":"MCP server for managing Prisma Postgres.","websiteUrl":null,"authType":"oauth2","isOfficial":true,"isPublished":true,"origin":"registry","createdAt":"2026-05-19T16:51:55.545Z","publishedAt":"2026-06-18T09:50:05.210Z","remotes":[{"id":26,"type":"sse","url":"https://mcp.prisma.io/sse"},{"id":27,"type":"streamable-http","url":"https://mcp.prisma.io/mcp"}],"tools":[],"tags":{"data":[]},"extendsCredential":null,"icons":[{"src":"https://n8niostorageaccount.blob.core.windows.net/n8nio-strapi-blobs-prod/assets/idz_L_5t_H6_B_e6163aea2d.jpg","mimeType":"image/jpeg","theme":"light"}]}	2026-06-30 16:29:56.303+00	2026-06-30 16:29:56.303+00
sanity	active	2.19.0	2026-06-11 19:30:10.774	{"id":16,"name":"io.sanity.www/mcp","title":"Sanity","tagline":"Connect to the Sanity MCP Server","description":"Direct access to your Sanity projects (content, datasets, releases, schemas) and agent rules","websiteUrl":null,"authType":"oauth2","isOfficial":true,"isPublished":true,"origin":"registry","createdAt":"2026-05-19T16:52:07.029Z","publishedAt":"2026-06-18T09:50:05.210Z","remotes":[{"id":28,"type":"streamable-http","url":"https://mcp.sanity.io"}],"tools":[],"tags":{"data":[]},"extendsCredential":null,"icons":[{"src":"https://n8niostorageaccount.blob.core.windows.net/n8nio-strapi-blobs-prod/assets/id_Qr019q7c_e4c0ec82b7.png","mimeType":"image/png","theme":"light"}]}	2026-06-30 16:29:56.303+00	2026-06-30 16:29:56.303+00
axiom	active	1.0.0	2026-06-11 19:28:11.99	{"id":17,"name":"co.axiom/mcp","title":"Axiom","tagline":"Connect to the Axiom MCP Server","description":"List datasets, schemas, run APL queries, and use prompts for exploration, anomalies, and monitoring.","websiteUrl":null,"authType":"oauth2","isOfficial":true,"isPublished":true,"origin":"registry","createdAt":"2026-05-19T16:52:18.335Z","publishedAt":"2026-06-18T09:50:05.210Z","remotes":[{"id":30,"type":"sse","url":"https://mcp.axiom.co/sse"},{"id":29,"type":"streamable-http","url":"https://mcp.axiom.co/mcp"}],"tools":[],"tags":{"data":[]},"extendsCredential":null,"icons":[{"src":"https://n8niostorageaccount.blob.core.windows.net/n8nio-strapi-blobs-prod/assets/id_Xjr_Dncs4_d8a390ab33.jpeg","mimeType":"image/jpeg","theme":"light"}]}	2026-06-30 16:29:56.303+00	2026-06-30 16:29:56.303+00
hugging-face	active	0.2.33	2026-06-11 19:28:18.177	{"id":18,"name":"co.huggingface/hf-mcp-server","title":"Hugging Face","tagline":"Connect to the Hugging Face MCP Server","description":"Connect to Hugging Face Hub and thousands of Gradio AI Applications","websiteUrl":null,"authType":"oauth2","isOfficial":true,"isPublished":true,"origin":"registry","createdAt":"2026-05-19T16:52:30.024Z","publishedAt":"2026-06-18T09:50:05.210Z","remotes":[{"id":32,"type":"streamable-http","url":"https://huggingface.co/mcp?login"},{"id":31,"type":"streamable-http","url":"https://huggingface.co/mcp"},{"id":33,"type":"streamable-http","url":"https://huggingface.co/mcp"}],"tools":[],"tags":{"data":[]},"extendsCredential":null,"icons":[{"src":"https://n8niostorageaccount.blob.core.windows.net/n8nio-strapi-blobs-prod/assets/id_S6h_Od6z2_c35cc34669.jpeg","mimeType":"image/jpeg","theme":"light"}]}	2026-06-30 16:29:56.303+00	2026-06-30 16:29:56.303+00
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.migrations (id, "timestamp", name) FROM stdin;
1	1587669153312	InitialMigration1587669153312
2	1589476000887	WebhookModel1589476000887
3	1594828256133	CreateIndexStoppedAt1594828256133
4	1607431743768	MakeStoppedAtNullable1607431743768
5	1611144599516	AddWebhookId1611144599516
6	1617270242566	CreateTagEntity1617270242566
7	1620824779533	UniqueWorkflowNames1620824779533
8	1626176912946	AddwaitTill1626176912946
9	1630419189837	UpdateWorkflowCredentials1630419189837
10	1644422880309	AddExecutionEntityIndexes1644422880309
11	1646834195327	IncreaseTypeVarcharLimit1646834195327
12	1646992772331	CreateUserManagement1646992772331
13	1648740597343	LowerCaseUserEmail1648740597343
14	1652254514002	CommunityNodes1652254514002
15	1652367743993	AddUserSettings1652367743993
16	1652905585850	AddAPIKeyColumn1652905585850
17	1654090467022	IntroducePinData1654090467022
18	1658932090381	AddNodeIds1658932090381
19	1659902242948	AddJsonKeyPinData1659902242948
20	1660062385367	CreateCredentialsUserRole1660062385367
21	1663755770893	CreateWorkflowsEditorRole1663755770893
22	1664196174001	WorkflowStatistics1664196174001
23	1665484192212	CreateCredentialUsageTable1665484192212
24	1665754637025	RemoveCredentialUsageTable1665754637025
25	1669739707126	AddWorkflowVersionIdColumn1669739707126
26	1669823906995	AddTriggerCountColumn1669823906995
27	1671535397530	MessageEventBusDestinations1671535397530
28	1671726148421	RemoveWorkflowDataLoadedFlag1671726148421
29	1673268682475	DeleteExecutionsWithWorkflows1673268682475
30	1674138566000	AddStatusToExecutions1674138566000
31	1674509946020	CreateLdapEntities1674509946020
32	1675940580449	PurgeInvalidWorkflowConnections1675940580449
33	1676996103000	MigrateExecutionStatus1676996103000
34	1677236854063	UpdateRunningExecutionStatus1677236854063
35	1677501636754	CreateVariables1677501636754
36	1679416281778	CreateExecutionMetadataTable1679416281778
37	1681134145996	AddUserActivatedProperty1681134145996
38	1681134145997	RemoveSkipOwnerSetup1681134145997
39	1690000000000	MigrateIntegerKeysToString1690000000000
40	1690000000020	SeparateExecutionData1690000000020
41	1690000000030	RemoveResetPasswordColumns1690000000030
42	1690000000030	AddMfaColumns1690000000030
43	1690787606731	AddMissingPrimaryKeyOnExecutionData1690787606731
44	1691088862123	CreateWorkflowNameIndex1691088862123
45	1692967111175	CreateWorkflowHistoryTable1692967111175
46	1693491613982	ExecutionSoftDelete1693491613982
47	1693554410387	DisallowOrphanExecutions1693554410387
48	1694091729095	MigrateToTimestampTz1694091729095
49	1695128658538	AddWorkflowMetadata1695128658538
50	1695829275184	ModifyWorkflowHistoryNodesAndConnections1695829275184
51	1700571993961	AddGlobalAdminRole1700571993961
52	1705429061930	DropRoleMapping1705429061930
53	1711018413374	RemoveFailedExecutionStatus1711018413374
54	1711390882123	MoveSshKeysToDatabase1711390882123
55	1712044305787	RemoveNodesAccess1712044305787
56	1714133768519	CreateProject1714133768519
57	1714133768521	MakeExecutionStatusNonNullable1714133768521
58	1717498465931	AddActivatedAtUserSetting1717498465931
59	1720101653148	AddConstraintToExecutionMetadata1720101653148
60	1721377157740	FixExecutionMetadataSequence1721377157740
61	1723627610222	CreateInvalidAuthTokenTable1723627610222
62	1723796243146	RefactorExecutionIndices1723796243146
63	1724753530828	CreateAnnotationTables1724753530828
64	1724951148974	AddApiKeysTable1724951148974
65	1726606152711	CreateProcessedDataTable1726606152711
66	1727427440136	SeparateExecutionCreationFromStart1727427440136
67	1728659839644	AddMissingPrimaryKeyOnAnnotationTagMapping1728659839644
68	1729607673464	UpdateProcessedDataValueColumnToText1729607673464
69	1729607673469	AddProjectIcons1729607673469
70	1730386903556	CreateTestDefinitionTable1730386903556
71	1731404028106	AddDescriptionToTestDefinition1731404028106
72	1731582748663	MigrateTestDefinitionKeyToString1731582748663
73	1732271325258	CreateTestMetricTable1732271325258
74	1732549866705	CreateTestRun1732549866705
75	1733133775640	AddMockedNodesColumnToTestDefinition1733133775640
76	1734479635324	AddManagedColumnToCredentialsTable1734479635324
77	1736172058779	AddStatsColumnsToTestRun1736172058779
78	1736947513045	CreateTestCaseExecutionTable1736947513045
79	1737715421462	AddErrorColumnsToTestRuns1737715421462
80	1738709609940	CreateFolderTable1738709609940
81	1739549398681	CreateAnalyticsTables1739549398681
82	1740445074052	UpdateParentFolderIdColumn1740445074052
83	1741167584277	RenameAnalyticsToInsights1741167584277
84	1742918400000	AddScopesColumnToApiKeys1742918400000
85	1745322634000	ClearEvaluation1745322634000
86	1745587087521	AddWorkflowStatisticsRootCount1745587087521
87	1745934666076	AddWorkflowArchivedColumn1745934666076
88	1745934666077	DropRoleTable1745934666077
89	1747824239000	AddProjectDescriptionColumn1747824239000
90	1750252139166	AddLastActiveAtColumnToUser1750252139166
91	1750252139166	AddScopeTables1750252139166
92	1750252139167	AddRolesTables1750252139167
93	1750252139168	LinkRoleToUserTable1750252139168
94	1750252139170	RemoveOldRoleColumn1750252139170
95	1752669793000	AddInputsOutputsToTestCaseExecution1752669793000
96	1753953244168	LinkRoleToProjectRelationTable1753953244168
97	1754475614601	CreateDataStoreTables1754475614601
98	1754475614602	ReplaceDataStoreTablesWithDataTables1754475614602
99	1756906557570	AddTimestampsToRoleAndRoleIndexes1756906557570
100	1758731786132	AddAudienceColumnToApiKeys1758731786132
101	1758794506893	AddProjectIdToVariableTable1758794506893
102	1759399811000	ChangeValueTypesForInsights1759399811000
103	1760019379982	CreateChatHubTables1760019379982
104	1760020000000	CreateChatHubAgentTable1760020000000
105	1760020838000	UniqueRoleNames1760020838000
106	1760116750277	CreateOAuthEntities1760116750277
107	1760314000000	CreateWorkflowDependencyTable1760314000000
108	1760965142113	DropUnusedChatHubColumns1760965142113
109	1761047826451	AddWorkflowVersionColumn1761047826451
110	1761655473000	ChangeDependencyInfoToJson1761655473000
111	1761773155024	AddAttachmentsToChatHubMessages1761773155024
112	1761830340990	AddToolsColumnToChatHubTables1761830340990
113	1762177736257	AddWorkflowDescriptionColumn1762177736257
114	1762763704614	BackfillMissingWorkflowHistoryRecords1762763704614
115	1762771264000	ChangeDefaultForIdInUserTable1762771264000
116	1762771954619	AddIsGlobalColumnToCredentialsTable1762771954619
117	1762847206508	AddWorkflowHistoryAutoSaveFields1762847206508
118	1763047800000	AddActiveVersionIdColumn1763047800000
119	1763048000000	ActivateExecuteWorkflowTriggerWorkflows1763048000000
120	1763572724000	ChangeOAuthStateColumnToUnboundedVarchar1763572724000
121	1763716655000	CreateBinaryDataTable1763716655000
122	1764167920585	CreateWorkflowPublishHistoryTable1764167920585
123	1764276827837	AddCreatorIdToProjectTable1764276827837
124	1764682447000	CreateDynamicCredentialResolverTable1764682447000
125	1764689388394	AddDynamicCredentialEntryTable1764689388394
126	1765448186933	BackfillMissingWorkflowHistoryRecords1765448186933
127	1765459448000	AddResolvableFieldsToCredentials1765459448000
128	1765788427674	AddIconToAgentTable1765788427674
129	1765804780000	ConvertAgentIdToUuid1765804780000
130	1765886667897	AddAgentIdForeignKeys1765886667897
131	1765892199653	AddWorkflowVersionIdToExecutionData1765892199653
132	1766064542000	AddWorkflowPublishScopeToProjectRoles1766064542000
133	1766068346315	AddChatMessageIndices1766068346315
134	1766500000000	ExpandInsightsWorkflowIdLength1766500000000
135	1767018516000	ChangeWorkflowStatisticsFKToNoAction1767018516000
136	1768402473068	ExpandModelColumnLength1768402473068
137	1768557000000	AddStoredAtToExecutionEntity1768557000000
138	1768901721000	AddDynamicCredentialUserEntryTable1768901721000
139	1769000000000	AddPublishedVersionIdToWorkflowDependency1769000000000
140	1769433700000	CreateSecretsProviderConnectionTables1769433700000
141	1769698710000	CreateWorkflowPublishedVersionTable1769698710000
142	1769784356000	ExpandSubjectIDColumnLength1769784356000
143	1769900001000	AddWorkflowUnpublishScopeToCustomRoles1769900001000
144	1770000000000	CreateChatHubToolsTable1770000000000
145	1770000000000	ExpandProviderIdColumnLength1770000000000
146	1770220686000	CreateWorkflowBuilderSessionTable1770220686000
147	1771417407753	AddScalingFieldsToTestRun1771417407753
148	1771500000000	MigrateExternalSecretsToEntityStorage1771500000000
149	1771500000001	AddUnshareScopeToCustomRoles1771500000001
150	1771500000002	AddFilesColumnToChatHubAgents1771500000002
151	1772000000000	AddSuggestedPromptsToAgentTable1772000000000
152	1772619247761	AddRoleColumnToProjectSecretsProviderAccess1772619247761
153	1772619247762	ChangeWorkflowPublishedVersionFKsToRestrict1772619247762
154	1772700000000	AddTypeToChatHubSessions1772700000000
155	1772800000000	CreateRoleMappingRuleTable1772800000000
156	1773000000000	CreateCredentialDependencyTable1773000000000
157	1774280963551	AddRestoreFieldsToWorkflowBuilderSession1774280963551
158	1774854660000	CreateInstanceVersionHistoryTable1774854660000
159	1775000000000	CreateInstanceAiTables1775000000000
160	1775116241000	CreateTokenExchangeJtiTable1775116241000
161	1775740765000	ChangeWorkflowPublishHistoryVersionIdToSetNull1775740765000
162	1776000000000	CreateTrustedKeyTables1776000000000
163	1776150756000	CreateFavoritesTable1776150756000
164	1777000000000	CreateDeploymentKeyTable1777000000000
165	1777023444000	AddJweKeyIndexesToDeploymentKey1777023444000
166	1777045000000	AddTracingContextToExecution1777045000000
167	1777100000000	AddLangsmithIdsToInstanceAiRunSnapshots1777100000000
168	1777281990043	CreateAiBuilderTemporaryWorkflowTable1777281990043
169	1777420800000	ExpandVariablesValueColumnToText1777420800000
170	1777996709110	AddRunIndexToTestCaseExecution1777996709110
171	1778000000000	AddExecutionDeduplicationKey1778000000000
172	1778100000000	CreateEvaluationConfig1778100000000
173	1778100001000	AddWorkflowVersionToTestRun1778100001000
174	1778100002000	AddEvaluationConfigColumnsToTestRun1778100002000
175	1778496086558	CreateEvaluationCollection1778496086558
176	1783000000000	CreateAgentTables1783000000000
177	1783000000001	CreateAgentExecutionTables1783000000001
178	1784000000000	CreateAgentObservationTables1784000000000
179	1784000000001	ReplaceAgentObservationTables1784000000001
180	1784000000002	DropAgentExecutionWorkingMemory1784000000002
181	1784000000003	LimitWorkflowVersionTriggerToContent1784000000003
182	1784000000004	AddInsightsRawTimestampIdIndex1784000000004
183	1784000000005	CreateMcpRegistryServerTable1784000000005
184	1784000000006	AddNodeGroupsColumnToWorkflowAndHistory1784000000006
185	1784000000007	CreateInstanceAiCheckpointTable1784000000007
186	1784000000008	ResetInstanceAiNativePersistence1784000000008
187	1784000000009	CreateAgentMemoryEntryTables1784000000009
188	1784000000010	RefactorAgentObservationScope1784000000010
189	1784000000011	CreateAgentHistoryTable1784000000011
190	1784000000012	CreateInstanceAiObservationTables1784000000012
191	1784000000013	SplitRedactionScopeInCustomRoles1784000000013
192	1784000000014	PersistInstanceAiPendingConfirmations1784000000014
193	1784000000015	AddSourceWorkflowIdToWorkflow1784000000015
194	1784000000016	UseSlugAsPrimaryKeyInMcpRegistryServer1784000000016
195	1784000000017	AddLastUsedAtToApiKey1784000000017
196	1784000000018	CreateAgentFilesTable1784000000018
197	1784000000019	AddCustomTelemetryTagsToProject1784000000019
198	1784000000021	CreateAgentTaskDefinitionTable1784000000021
199	1784000000022	AddSubAgentLinkageToAgentExecutionThreads1784000000022
200	1784000000023	CreateInstanceAiMcpRegistryConnectionTable1784000000023
201	1784000000024	AddResourceToOAuthAuthorizationCodes1784000000024
202	1784000000025	MigrateRedactionEnforcementToFloor1784000000025
203	1784000000026	AddScopeColumnToOAuthTables1784000000026
204	1784000000027	CreateWorkflowPublicationOutboxTable1784000000027
205	1784000000028	AddProjectIdToInstanceAiThread1784000000028
206	1784000000029	AddJsonSizeBytesAndWorkflowVersionIdToExecutionEntity1784000000029
207	1784000000030	CreateAgentChatSubscriptions1784000000030
208	1784000000031	AddExecutionEntityWorkflowStatusIndex1784000000031
209	1784000000033	AddBinaryDataSizeBytesToExecutionEntity1784000000033
210	1784000000034	AllowAzureStoredAt1784000000034
211	1784000000035	AddUniqueAgentFileNames1784000000035
212	1784000000036	CreateInstanceAiThreadGrantTable1784000000036
\.


--
-- Data for Name: oauth_access_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.oauth_access_tokens (token, "clientId", "userId") FROM stdin;
\.


--
-- Data for Name: oauth_authorization_codes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.oauth_authorization_codes (code, "clientId", "userId", "redirectUri", "codeChallenge", "codeChallengeMethod", "expiresAt", state, used, "createdAt", "updatedAt", resource, scope) FROM stdin;
\.


--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.oauth_clients (id, name, "redirectUris", "grantTypes", "clientSecret", "clientSecretExpiresAt", "tokenEndpointAuthMethod", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: oauth_refresh_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.oauth_refresh_tokens (token, "clientId", "userId", "expiresAt", "createdAt", "updatedAt", scope) FROM stdin;
\.


--
-- Data for Name: oauth_user_consents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.oauth_user_consents (id, "userId", "clientId", "grantedAt") FROM stdin;
\.


--
-- Data for Name: processed_data; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.processed_data ("workflowId", context, "createdAt", "updatedAt", value) FROM stdin;
\.


--
-- Data for Name: project; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.project (id, name, type, "createdAt", "updatedAt", icon, description, "creatorId", "customTelemetryTags") FROM stdin;
QGsFzdGXWFTYynTH	Thatchavit Thaveechaiyagarn <iamthatchavit@gmail.com>	personal	2026-06-30 16:29:53.77+00	2026-06-30 16:33:05.497+00	\N	\N	f533e7c0-27a9-4b00-adbb-44b596191384	[]
\.


--
-- Data for Name: project_relation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.project_relation ("projectId", "userId", role, "createdAt", "updatedAt") FROM stdin;
QGsFzdGXWFTYynTH	f533e7c0-27a9-4b00-adbb-44b596191384	project:personalOwner	2026-06-30 16:29:53.77+00	2026-06-30 16:29:53.77+00
\.


--
-- Data for Name: project_secrets_provider_access; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.project_secrets_provider_access ("secretsProviderConnectionId", "projectId", "createdAt", "updatedAt", role) FROM stdin;
\.


--
-- Data for Name: role; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role (slug, "displayName", description, "roleType", "systemRole", "createdAt", "updatedAt") FROM stdin;
global:chatUser	Chat User	Chat User	global	t	2026-06-30 16:29:55.133+00	2026-06-30 16:29:55.133+00
global:owner	Owner	Owner	global	t	2026-06-30 16:29:54.126+00	2026-06-30 16:29:55.145+00
global:admin	Admin	Admin	global	t	2026-06-30 16:29:54.126+00	2026-06-30 16:29:55.145+00
global:member	Member	Member	global	t	2026-06-30 16:29:54.126+00	2026-06-30 16:29:55.145+00
project:admin	Project Admin	Full control of settings, members, workflows, credentials and executions	project	t	2026-06-30 16:29:54.126+00	2026-06-30 16:29:55.155+00
project:personalOwner	Project Owner	Project Owner	project	t	2026-06-30 16:29:54.126+00	2026-06-30 16:29:55.155+00
project:editor	Project Editor	Create, edit, and delete workflows, credentials, and executions	project	t	2026-06-30 16:29:54.126+00	2026-06-30 16:29:55.155+00
project:viewer	Project Viewer	Read-only access to workflows, credentials, and executions	project	t	2026-06-30 16:29:54.126+00	2026-06-30 16:29:55.155+00
project:chatUser	Project Chat User	Chat-only access to chatting with workflows that have n8n Chat enabled	project	t	2026-06-30 16:29:54.126+00	2026-06-30 16:29:55.155+00
credential:owner	Credential Owner	Credential Owner	credential	t	2026-06-30 16:29:55.133+00	2026-06-30 16:29:55.133+00
credential:user	Credential User	Credential User	credential	t	2026-06-30 16:29:55.133+00	2026-06-30 16:29:55.133+00
workflow:owner	Workflow Owner	Workflow Owner	workflow	t	2026-06-30 16:29:55.133+00	2026-06-30 16:29:55.133+00
workflow:editor	Workflow Editor	Workflow Editor	workflow	t	2026-06-30 16:29:55.133+00	2026-06-30 16:29:55.133+00
secretsProviderConnection:owner	Secrets Provider Connection Owner	Full control of secrets provider connection settings and secrets	secretsProviderConnection	t	2026-06-30 16:29:55.133+00	2026-06-30 16:29:55.133+00
secretsProviderConnection:user	Secrets Provider Connection User	Read-only access to use secrets from the connection	secretsProviderConnection	t	2026-06-30 16:29:55.133+00	2026-06-30 16:29:55.133+00
\.


--
-- Data for Name: role_mapping_rule; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role_mapping_rule (id, expression, role, type, "order", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: role_mapping_rule_project; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role_mapping_rule_project ("roleMappingRuleId", "projectId") FROM stdin;
\.


--
-- Data for Name: role_scope; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role_scope ("roleSlug", "scopeSlug") FROM stdin;
global:owner	workflow:unpublish
global:owner	workflow:unshare
global:owner	credential:unshare
global:owner	agent:create
global:owner	agent:read
global:owner	agent:update
global:owner	agent:delete
global:owner	agent:list
global:owner	agent:execute
global:owner	agent:publish
global:owner	agent:unpublish
global:owner	agent:manage
global:owner	aiAssistant:manage
global:owner	annotationTag:create
global:owner	annotationTag:read
global:owner	annotationTag:update
global:owner	annotationTag:delete
global:owner	annotationTag:list
global:owner	auditLogs:manage
global:owner	banner:dismiss
global:owner	community:register
global:owner	communityPackage:install
global:owner	communityPackage:uninstall
global:owner	communityPackage:update
global:owner	communityPackage:list
global:owner	credential:share
global:owner	credential:shareGlobally
global:owner	credential:move
global:owner	credential:create
global:owner	credential:read
global:owner	credential:update
global:owner	credential:delete
global:owner	credential:list
global:owner	externalSecretsProvider:sync
global:owner	externalSecretsProvider:create
global:owner	externalSecretsProvider:read
global:owner	externalSecretsProvider:update
global:owner	externalSecretsProvider:delete
global:owner	externalSecretsProvider:list
global:owner	externalSecret:list
global:owner	eventBusDestination:test
global:owner	eventBusDestination:create
global:owner	eventBusDestination:read
global:owner	eventBusDestination:update
global:owner	eventBusDestination:delete
global:owner	eventBusDestination:list
global:owner	ldap:sync
global:owner	ldap:manage
global:owner	license:manage
global:owner	logStreaming:manage
global:owner	orchestration:read
global:owner	project:create
global:owner	project:read
global:owner	project:update
global:owner	project:delete
global:owner	project:list
global:owner	saml:manage
global:owner	securityAudit:generate
global:owner	securitySettings:manage
global:owner	sourceControl:pull
global:owner	sourceControl:push
global:owner	sourceControl:manage
global:owner	tag:create
global:owner	tag:read
global:owner	tag:update
global:owner	tag:delete
global:owner	tag:list
global:owner	user:resetPassword
global:owner	user:changeRole
global:owner	user:enforceMfa
global:owner	user:generateInviteLink
global:owner	user:create
global:owner	user:read
global:owner	user:update
global:owner	user:delete
global:owner	user:list
global:owner	variable:create
global:owner	variable:read
global:owner	variable:update
global:owner	variable:delete
global:owner	variable:list
global:owner	projectVariable:create
global:owner	projectVariable:read
global:owner	projectVariable:update
global:owner	projectVariable:delete
global:owner	projectVariable:list
global:owner	workersView:manage
global:owner	workflow:share
global:owner	workflow:execute
global:owner	workflow:execute-chat
global:owner	workflow:export
global:owner	workflow:import
global:owner	workflow:move
global:owner	workflow:create
global:owner	workflow:read
global:owner	workflow:update
global:owner	workflow:delete
global:owner	workflow:list
global:owner	folder:create
global:owner	folder:read
global:owner	folder:update
global:owner	folder:delete
global:owner	folder:list
global:owner	folder:move
global:owner	insights:list
global:owner	insights:read
global:owner	oidc:manage
global:owner	provisioning:manage
global:owner	dataTable:create
global:owner	dataTable:read
global:owner	dataTable:update
global:owner	dataTable:delete
global:owner	dataTable:list
global:owner	dataTable:readRow
global:owner	dataTable:writeRow
global:owner	dataTable:readColumn
global:owner	dataTable:writeColumn
global:owner	dataTable:listProject
global:owner	execution:reveal
global:owner	role:manage
global:owner	mcp:manage
global:owner	mcp:oauth
global:owner	mcpApiKey:create
global:owner	mcpApiKey:rotate
global:owner	chatHub:manage
global:owner	chatHub:message
global:owner	chatHubAgent:create
global:owner	chatHubAgent:read
global:owner	chatHubAgent:update
global:owner	chatHubAgent:delete
global:owner	chatHubAgent:list
global:owner	breakingChanges:list
global:owner	apiKey:manage
global:owner	apiKey:list
global:owner	apiKey:create
global:owner	apiKey:delete
global:owner	apiKey:update
global:owner	encryptionKey:manage
global:owner	credentialResolver:create
global:owner	credentialResolver:read
global:owner	credentialResolver:update
global:owner	credentialResolver:delete
global:owner	credentialResolver:list
global:owner	instanceAi:message
global:owner	instanceAi:manage
global:owner	instanceAi:gateway
global:owner	instanceAi:eval
global:owner	roleMappingRule:create
global:owner	roleMappingRule:read
global:owner	roleMappingRule:update
global:owner	roleMappingRule:delete
global:owner	roleMappingRule:list
global:owner	otel:manage
global:owner	workflow:publish
global:owner	workflow:enableRedaction
global:owner	workflow:disableRedaction
global:admin	workflow:unpublish
global:admin	workflow:unshare
global:admin	credential:unshare
global:admin	agent:create
global:admin	agent:read
global:admin	agent:update
global:admin	agent:delete
global:admin	agent:list
global:admin	agent:execute
global:admin	agent:publish
global:admin	agent:unpublish
global:admin	agent:manage
global:admin	aiAssistant:manage
global:admin	annotationTag:create
global:admin	annotationTag:read
global:admin	annotationTag:update
global:admin	annotationTag:delete
global:admin	annotationTag:list
global:admin	auditLogs:manage
global:admin	banner:dismiss
global:admin	community:register
global:admin	communityPackage:install
global:admin	communityPackage:uninstall
global:admin	communityPackage:update
global:admin	communityPackage:list
global:admin	credential:share
global:admin	credential:shareGlobally
global:admin	credential:move
global:admin	credential:create
global:admin	credential:read
global:admin	credential:update
global:admin	credential:delete
global:admin	credential:list
global:admin	externalSecretsProvider:sync
global:admin	externalSecretsProvider:create
global:admin	externalSecretsProvider:read
global:admin	externalSecretsProvider:update
global:admin	externalSecretsProvider:delete
global:admin	externalSecretsProvider:list
global:admin	externalSecret:list
global:admin	eventBusDestination:test
global:admin	eventBusDestination:create
global:admin	eventBusDestination:read
global:admin	eventBusDestination:update
global:admin	eventBusDestination:delete
global:admin	eventBusDestination:list
global:admin	ldap:sync
global:admin	ldap:manage
global:admin	license:manage
global:admin	logStreaming:manage
global:admin	orchestration:read
global:admin	project:create
global:admin	project:read
global:admin	project:update
global:admin	project:delete
global:admin	project:list
global:admin	saml:manage
global:admin	securityAudit:generate
global:admin	securitySettings:manage
global:admin	sourceControl:pull
global:admin	sourceControl:push
global:admin	sourceControl:manage
global:admin	tag:create
global:admin	tag:read
global:admin	tag:update
global:admin	tag:delete
global:admin	tag:list
global:admin	user:resetPassword
global:admin	user:changeRole
global:admin	user:enforceMfa
global:admin	user:generateInviteLink
global:admin	user:create
global:admin	user:read
global:admin	user:update
global:admin	user:delete
global:admin	user:list
global:admin	variable:create
global:admin	variable:read
global:admin	variable:update
global:admin	variable:delete
global:admin	variable:list
global:admin	projectVariable:create
global:admin	projectVariable:read
global:admin	projectVariable:update
global:admin	projectVariable:delete
global:admin	projectVariable:list
global:admin	workersView:manage
global:admin	workflow:share
global:admin	workflow:execute
global:admin	workflow:execute-chat
global:admin	workflow:export
global:admin	workflow:import
global:admin	workflow:move
global:admin	workflow:create
global:admin	workflow:read
global:admin	workflow:update
global:admin	workflow:delete
global:admin	workflow:list
global:admin	folder:create
global:admin	folder:read
global:admin	folder:update
global:admin	folder:delete
global:admin	folder:list
global:admin	folder:move
global:admin	insights:list
global:admin	insights:read
global:admin	oidc:manage
global:admin	provisioning:manage
global:admin	dataTable:create
global:admin	dataTable:read
global:admin	dataTable:update
global:admin	dataTable:delete
global:admin	dataTable:list
global:admin	dataTable:readRow
global:admin	dataTable:writeRow
global:admin	dataTable:readColumn
global:admin	dataTable:writeColumn
global:admin	dataTable:listProject
global:admin	execution:reveal
global:admin	role:manage
global:admin	mcp:manage
global:admin	mcp:oauth
global:admin	mcpApiKey:create
global:admin	mcpApiKey:rotate
global:admin	chatHub:manage
global:admin	chatHub:message
global:admin	chatHubAgent:create
global:admin	chatHubAgent:read
global:admin	chatHubAgent:update
global:admin	chatHubAgent:delete
global:admin	chatHubAgent:list
global:admin	breakingChanges:list
global:admin	apiKey:manage
global:admin	apiKey:list
global:admin	apiKey:create
global:admin	apiKey:delete
global:admin	apiKey:update
global:admin	encryptionKey:manage
global:admin	credentialResolver:create
global:admin	credentialResolver:read
global:admin	credentialResolver:update
global:admin	credentialResolver:delete
global:admin	credentialResolver:list
global:admin	instanceAi:message
global:admin	instanceAi:manage
global:admin	instanceAi:gateway
global:admin	instanceAi:eval
global:admin	roleMappingRule:create
global:admin	roleMappingRule:read
global:admin	roleMappingRule:update
global:admin	roleMappingRule:delete
global:admin	roleMappingRule:list
global:admin	otel:manage
global:admin	workflow:publish
global:admin	workflow:enableRedaction
global:admin	workflow:disableRedaction
global:member	annotationTag:create
global:member	annotationTag:read
global:member	annotationTag:update
global:member	annotationTag:delete
global:member	annotationTag:list
global:member	eventBusDestination:test
global:member	eventBusDestination:list
global:member	tag:create
global:member	tag:read
global:member	tag:update
global:member	tag:list
global:member	user:list
global:member	variable:read
global:member	variable:list
global:member	dataTable:list
global:member	mcp:oauth
global:member	mcpApiKey:create
global:member	mcpApiKey:rotate
global:member	chatHub:message
global:member	chatHubAgent:create
global:member	chatHubAgent:read
global:member	chatHubAgent:update
global:member	chatHubAgent:delete
global:member	chatHubAgent:list
global:member	apiKey:list
global:member	apiKey:create
global:member	apiKey:delete
global:member	apiKey:update
global:member	credentialResolver:list
global:member	instanceAi:message
global:member	instanceAi:gateway
global:chatUser	chatHub:message
global:chatUser	chatHubAgent:create
global:chatUser	chatHubAgent:read
global:chatUser	chatHubAgent:update
global:chatUser	chatHubAgent:delete
global:chatUser	chatHubAgent:list
project:admin	workflow:unpublish
project:admin	credential:unshare
project:admin	agent:create
project:admin	agent:read
project:admin	agent:update
project:admin	agent:delete
project:admin	agent:list
project:admin	agent:execute
project:admin	agent:publish
project:admin	agent:unpublish
project:admin	credential:share
project:admin	credential:move
project:admin	credential:create
project:admin	credential:read
project:admin	credential:update
project:admin	credential:delete
project:admin	credential:list
project:admin	project:read
project:admin	project:update
project:admin	project:delete
project:admin	project:list
project:admin	sourceControl:push
project:admin	projectVariable:create
project:admin	projectVariable:read
project:admin	projectVariable:update
project:admin	projectVariable:delete
project:admin	projectVariable:list
project:admin	workflow:execute
project:admin	workflow:execute-chat
project:admin	workflow:export
project:admin	workflow:import
project:admin	workflow:move
project:admin	workflow:create
project:admin	workflow:read
project:admin	workflow:update
project:admin	workflow:delete
project:admin	workflow:list
project:admin	folder:create
project:admin	folder:read
project:admin	folder:update
project:admin	folder:delete
project:admin	folder:list
project:admin	folder:move
project:admin	dataTable:create
project:admin	dataTable:read
project:admin	dataTable:update
project:admin	dataTable:delete
project:admin	dataTable:readRow
project:admin	dataTable:writeRow
project:admin	dataTable:readColumn
project:admin	dataTable:writeColumn
project:admin	dataTable:listProject
project:admin	execution:reveal
project:admin	workflow:publish
project:admin	workflow:enableRedaction
project:admin	workflow:disableRedaction
project:personalOwner	workflow:unpublish
project:personalOwner	workflow:unshare
project:personalOwner	credential:unshare
project:personalOwner	agent:create
project:personalOwner	agent:read
project:personalOwner	agent:update
project:personalOwner	agent:delete
project:personalOwner	agent:list
project:personalOwner	agent:execute
project:personalOwner	agent:publish
project:personalOwner	agent:unpublish
project:personalOwner	credential:share
project:personalOwner	credential:move
project:personalOwner	credential:create
project:personalOwner	credential:read
project:personalOwner	credential:update
project:personalOwner	credential:delete
project:personalOwner	credential:list
project:personalOwner	project:read
project:personalOwner	project:list
project:personalOwner	workflow:share
project:personalOwner	workflow:execute
project:personalOwner	workflow:execute-chat
project:personalOwner	workflow:export
project:personalOwner	workflow:import
project:personalOwner	workflow:move
project:personalOwner	workflow:create
project:personalOwner	workflow:read
project:personalOwner	workflow:update
project:personalOwner	workflow:delete
project:personalOwner	workflow:list
project:personalOwner	folder:create
project:personalOwner	folder:read
project:personalOwner	folder:update
project:personalOwner	folder:delete
project:personalOwner	folder:list
project:personalOwner	folder:move
project:personalOwner	dataTable:create
project:personalOwner	dataTable:read
project:personalOwner	dataTable:update
project:personalOwner	dataTable:delete
project:personalOwner	dataTable:readRow
project:personalOwner	dataTable:writeRow
project:personalOwner	dataTable:readColumn
project:personalOwner	dataTable:writeColumn
project:personalOwner	dataTable:listProject
project:personalOwner	execution:reveal
project:personalOwner	workflow:publish
project:personalOwner	workflow:enableRedaction
project:personalOwner	workflow:disableRedaction
project:editor	workflow:unpublish
project:editor	agent:create
project:editor	agent:read
project:editor	agent:update
project:editor	agent:delete
project:editor	agent:list
project:editor	agent:execute
project:editor	agent:publish
project:editor	agent:unpublish
project:editor	credential:create
project:editor	credential:read
project:editor	credential:update
project:editor	credential:delete
project:editor	credential:list
project:editor	project:read
project:editor	project:list
project:editor	projectVariable:create
project:editor	projectVariable:read
project:editor	projectVariable:update
project:editor	projectVariable:delete
project:editor	projectVariable:list
project:editor	workflow:execute
project:editor	workflow:execute-chat
project:editor	workflow:export
project:editor	workflow:import
project:editor	workflow:create
project:editor	workflow:read
project:editor	workflow:update
project:editor	workflow:delete
project:editor	workflow:list
project:editor	folder:create
project:editor	folder:read
project:editor	folder:update
project:editor	folder:delete
project:editor	folder:list
project:editor	dataTable:create
project:editor	dataTable:read
project:editor	dataTable:update
project:editor	dataTable:delete
project:editor	dataTable:readRow
project:editor	dataTable:writeRow
project:editor	dataTable:readColumn
project:editor	dataTable:writeColumn
project:editor	dataTable:listProject
project:editor	workflow:publish
project:viewer	agent:read
project:viewer	agent:list
project:viewer	agent:execute
project:viewer	credential:read
project:viewer	credential:list
project:viewer	project:read
project:viewer	project:list
project:viewer	projectVariable:read
project:viewer	projectVariable:list
project:viewer	workflow:execute-chat
project:viewer	workflow:export
project:viewer	workflow:read
project:viewer	workflow:list
project:viewer	folder:read
project:viewer	folder:list
project:viewer	dataTable:read
project:viewer	dataTable:readRow
project:viewer	dataTable:readColumn
project:viewer	dataTable:listProject
project:chatUser	agent:execute
project:chatUser	workflow:execute-chat
credential:owner	credential:unshare
credential:owner	credential:share
credential:owner	credential:move
credential:owner	credential:read
credential:owner	credential:update
credential:owner	credential:delete
credential:user	credential:read
workflow:owner	workflow:unpublish
workflow:owner	workflow:unshare
workflow:owner	workflow:share
workflow:owner	workflow:execute
workflow:owner	workflow:execute-chat
workflow:owner	workflow:export
workflow:owner	workflow:move
workflow:owner	workflow:read
workflow:owner	workflow:update
workflow:owner	workflow:delete
workflow:owner	execution:reveal
workflow:owner	workflow:publish
workflow:owner	workflow:enableRedaction
workflow:owner	workflow:disableRedaction
workflow:editor	workflow:unpublish
workflow:editor	workflow:execute
workflow:editor	workflow:execute-chat
workflow:editor	workflow:export
workflow:editor	workflow:read
workflow:editor	workflow:update
workflow:editor	workflow:publish
secretsProviderConnection:owner	externalSecretsProvider:sync
secretsProviderConnection:owner	externalSecretsProvider:read
secretsProviderConnection:owner	externalSecretsProvider:update
secretsProviderConnection:owner	externalSecretsProvider:delete
secretsProviderConnection:owner	externalSecretsProvider:list
secretsProviderConnection:owner	externalSecret:list
secretsProviderConnection:user	externalSecretsProvider:read
secretsProviderConnection:user	externalSecretsProvider:list
secretsProviderConnection:user	externalSecret:list
\.


--
-- Data for Name: scope; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.scope (slug, "displayName", description) FROM stdin;
workflow:unpublish	Unpublish Workflow	Allows unpublishing workflows.
workflow:unshare	Unshare Workflow	Allows removing workflow shares.
credential:unshare	Unshare Credential	Allows removing credential shares.
agent:create	Create Agent	Allows creating new agents in a project.
agent:read	Read Agent	Allows reading agent configuration and history.
agent:update	Update Agent	Allows updating, building, publishing, and managing integrations of agents.
agent:delete	Delete Agent	Allows deleting agents.
agent:list	List Agents	Allows listing agents in a project.
agent:execute	Execute Agent	Allows running agents in chat.
agent:publish	Publish Agent	Allows publishing agents.
agent:unpublish	Unpublish Agent	Allows unpublishing agents.
agent:manage	agent:manage	\N
agent:*	agent:*	\N
aiAssistant:manage	Manage AI Usage	Allows managing AI Usage settings.
aiAssistant:*	aiAssistant:*	\N
annotationTag:create	Create Annotation Tag	Allows creating new annotation tags.
annotationTag:read	annotationTag:read	\N
annotationTag:update	annotationTag:update	\N
annotationTag:delete	annotationTag:delete	\N
annotationTag:list	annotationTag:list	\N
annotationTag:*	annotationTag:*	\N
auditLogs:manage	auditLogs:manage	\N
auditLogs:*	auditLogs:*	\N
banner:dismiss	banner:dismiss	\N
banner:*	banner:*	\N
community:register	community:register	\N
community:*	community:*	\N
communityPackage:install	communityPackage:install	\N
communityPackage:uninstall	communityPackage:uninstall	\N
communityPackage:update	communityPackage:update	\N
communityPackage:list	communityPackage:list	\N
communityPackage:manage	communityPackage:manage	\N
communityPackage:*	communityPackage:*	\N
credential:share	credential:share	\N
credential:shareGlobally	credential:shareGlobally	\N
credential:move	credential:move	\N
credential:create	credential:create	\N
credential:read	credential:read	\N
credential:update	credential:update	\N
credential:delete	credential:delete	\N
credential:list	credential:list	\N
credential:*	credential:*	\N
externalSecretsProvider:sync	externalSecretsProvider:sync	\N
externalSecretsProvider:create	externalSecretsProvider:create	\N
externalSecretsProvider:read	externalSecretsProvider:read	\N
externalSecretsProvider:update	externalSecretsProvider:update	\N
externalSecretsProvider:delete	externalSecretsProvider:delete	\N
externalSecretsProvider:list	externalSecretsProvider:list	\N
externalSecretsProvider:*	externalSecretsProvider:*	\N
externalSecret:list	externalSecret:list	\N
externalSecret:*	externalSecret:*	\N
eventBusDestination:test	eventBusDestination:test	\N
eventBusDestination:create	eventBusDestination:create	\N
eventBusDestination:read	eventBusDestination:read	\N
eventBusDestination:update	eventBusDestination:update	\N
eventBusDestination:delete	eventBusDestination:delete	\N
eventBusDestination:list	eventBusDestination:list	\N
eventBusDestination:*	eventBusDestination:*	\N
ldap:sync	ldap:sync	\N
ldap:manage	ldap:manage	\N
ldap:*	ldap:*	\N
license:manage	license:manage	\N
license:*	license:*	\N
logStreaming:manage	logStreaming:manage	\N
logStreaming:*	logStreaming:*	\N
orchestration:read	orchestration:read	\N
orchestration:list	orchestration:list	\N
orchestration:*	orchestration:*	\N
project:create	project:create	\N
project:read	project:read	\N
project:update	project:update	\N
project:delete	project:delete	\N
project:list	project:list	\N
project:*	project:*	\N
saml:manage	saml:manage	\N
saml:*	saml:*	\N
securityAudit:generate	securityAudit:generate	\N
securityAudit:*	securityAudit:*	\N
securitySettings:manage	securitySettings:manage	\N
securitySettings:*	securitySettings:*	\N
sourceControl:pull	sourceControl:pull	\N
sourceControl:push	sourceControl:push	\N
sourceControl:manage	sourceControl:manage	\N
sourceControl:*	sourceControl:*	\N
tag:create	tag:create	\N
tag:read	tag:read	\N
tag:update	tag:update	\N
tag:delete	tag:delete	\N
tag:list	tag:list	\N
tag:*	tag:*	\N
user:resetPassword	user:resetPassword	\N
user:changeRole	user:changeRole	\N
user:enforceMfa	user:enforceMfa	\N
user:generateInviteLink	user:generateInviteLink	\N
user:create	user:create	\N
user:read	user:read	\N
user:update	user:update	\N
user:delete	user:delete	\N
user:list	user:list	\N
user:*	user:*	\N
variable:create	variable:create	\N
variable:read	variable:read	\N
variable:update	variable:update	\N
variable:delete	variable:delete	\N
variable:list	variable:list	\N
variable:*	variable:*	\N
projectVariable:create	projectVariable:create	\N
projectVariable:read	projectVariable:read	\N
projectVariable:update	projectVariable:update	\N
projectVariable:delete	projectVariable:delete	\N
projectVariable:list	projectVariable:list	\N
projectVariable:*	projectVariable:*	\N
workersView:manage	workersView:manage	\N
workersView:*	workersView:*	\N
workflow:share	workflow:share	\N
workflow:execute	workflow:execute	\N
workflow:execute-chat	workflow:execute-chat	\N
workflow:export	Export Workflow	Allows including workflows in a portable package export.
workflow:import	Import Workflow	Allows importing workflows from a portable package into the project.
workflow:move	workflow:move	\N
workflow:activate	workflow:activate	\N
workflow:deactivate	workflow:deactivate	\N
workflow:create	workflow:create	\N
workflow:read	workflow:read	\N
workflow:update	workflow:update	\N
workflow:delete	workflow:delete	\N
workflow:list	workflow:list	\N
workflow:*	workflow:*	\N
folder:create	folder:create	\N
folder:read	folder:read	\N
folder:update	folder:update	\N
folder:delete	folder:delete	\N
folder:list	folder:list	\N
folder:move	folder:move	\N
folder:*	folder:*	\N
insights:list	insights:list	\N
insights:read	Read Insights	Allows reading insights data.
insights:*	insights:*	\N
oidc:manage	oidc:manage	\N
oidc:*	oidc:*	\N
provisioning:manage	provisioning:manage	\N
provisioning:*	provisioning:*	\N
dataTable:create	dataTable:create	\N
dataTable:read	dataTable:read	\N
dataTable:update	dataTable:update	\N
dataTable:delete	dataTable:delete	\N
dataTable:list	dataTable:list	\N
dataTable:readRow	dataTable:readRow	\N
dataTable:writeRow	dataTable:writeRow	\N
dataTable:readColumn	dataTable:readColumn	\N
dataTable:writeColumn	dataTable:writeColumn	\N
dataTable:listProject	dataTable:listProject	\N
dataTable:*	dataTable:*	\N
execution:delete	execution:delete	\N
execution:read	execution:read	\N
execution:retry	execution:retry	\N
execution:list	execution:list	\N
execution:get	execution:get	\N
execution:reveal	execution:reveal	\N
execution:*	execution:*	\N
workflowTags:update	workflowTags:update	\N
workflowTags:list	workflowTags:list	\N
workflowTags:*	workflowTags:*	\N
role:manage	role:manage	\N
role:*	role:*	\N
mcp:manage	mcp:manage	\N
mcp:oauth	mcp:oauth	\N
mcp:*	mcp:*	\N
mcpApiKey:create	mcpApiKey:create	\N
mcpApiKey:rotate	mcpApiKey:rotate	\N
mcpApiKey:*	mcpApiKey:*	\N
chatHub:manage	chatHub:manage	\N
chatHub:message	chatHub:message	\N
chatHub:*	chatHub:*	\N
chatHubAgent:create	chatHubAgent:create	\N
chatHubAgent:read	chatHubAgent:read	\N
chatHubAgent:update	chatHubAgent:update	\N
chatHubAgent:delete	chatHubAgent:delete	\N
chatHubAgent:list	chatHubAgent:list	\N
chatHubAgent:*	chatHubAgent:*	\N
breakingChanges:list	breakingChanges:list	\N
breakingChanges:*	breakingChanges:*	\N
apiKey:manage	apiKey:manage	\N
apiKey:list	apiKey:list	\N
apiKey:create	apiKey:create	\N
apiKey:delete	apiKey:delete	\N
apiKey:update	apiKey:update	\N
apiKey:*	apiKey:*	\N
encryptionKey:manage	Manage Encryption Keys	Allows listing and rotating instance encryption keys.
encryptionKey:*	encryptionKey:*	\N
credentialResolver:create	credentialResolver:create	\N
credentialResolver:read	credentialResolver:read	\N
credentialResolver:update	credentialResolver:update	\N
credentialResolver:delete	credentialResolver:delete	\N
credentialResolver:list	credentialResolver:list	\N
credentialResolver:*	credentialResolver:*	\N
instanceAi:message	instanceAi:message	\N
instanceAi:manage	instanceAi:manage	\N
instanceAi:gateway	instanceAi:gateway	\N
instanceAi:eval	instanceAi:eval	\N
instanceAi:*	instanceAi:*	\N
roleMappingRule:create	roleMappingRule:create	\N
roleMappingRule:read	roleMappingRule:read	\N
roleMappingRule:update	roleMappingRule:update	\N
roleMappingRule:delete	roleMappingRule:delete	\N
roleMappingRule:list	roleMappingRule:list	\N
roleMappingRule:*	roleMappingRule:*	\N
otel:manage	otel:manage	\N
otel:*	otel:*	\N
*	*	\N
workflow:publish	Publish Workflow	Allows publishing workflows.
workflow:enableRedaction	workflow:enableRedaction	\N
workflow:disableRedaction	workflow:disableRedaction	\N
\.


--
-- Data for Name: secrets_provider_connection; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.secrets_provider_connection (id, "providerKey", type, "encryptedSettings", "isEnabled", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.settings (key, value, "loadOnStartup") FROM stdin;
ui.banners.dismissed	["V1"]	t
features.ldap	{"loginEnabled":false,"loginLabel":"","connectionUrl":"","allowUnauthorizedCerts":false,"connectionSecurity":"none","connectionPort":389,"baseDn":"","bindingAdminDn":"","bindingAdminPassword":"","firstNameAttribute":"","lastNameAttribute":"","emailAttribute":"","loginIdAttribute":"","ldapIdAttribute":"","userFilter":"","synchronizationEnabled":false,"synchronizationInterval":60,"searchPageSize":0,"searchTimeout":60,"enforceEmailUniqueness":true}	t
userManagement.isInstanceOwnerSetUp	true	t
instance.firstProductionFailure	{"workflowId":"Si28JZdUotdLzill","projectId":"QGsFzdGXWFTYynTH","userId":"f533e7c0-27a9-4b00-adbb-44b596191384","timestamp":1782902738106}	f
\.


--
-- Data for Name: shared_credentials; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shared_credentials ("credentialsId", "projectId", role, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: shared_workflow; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shared_workflow ("workflowId", "projectId", role, "createdAt", "updatedAt") FROM stdin;
Si28JZdUotdLzill	QGsFzdGXWFTYynTH	workflow:owner	2026-06-30 16:42:09.002+00	2026-06-30 16:42:09.002+00
\.


--
-- Data for Name: tag_entity; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tag_entity (name, "createdAt", "updatedAt", id) FROM stdin;
\.


--
-- Data for Name: test_case_execution; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.test_case_execution (id, "testRunId", "executionId", status, "runAt", "completedAt", "errorCode", "errorDetails", metrics, "createdAt", "updatedAt", inputs, outputs, "runIndex") FROM stdin;
\.


--
-- Data for Name: test_run; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.test_run (id, "workflowId", status, "errorCode", "errorDetails", "runAt", "completedAt", metrics, "createdAt", "updatedAt", "runningInstanceId", "cancelRequested", "workflowVersionId", "evaluationConfigId", "evaluationConfigSnapshot", "collectionId") FROM stdin;
\.


--
-- Data for Name: token_exchange_jti; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.token_exchange_jti (jti, "expiresAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: trusted_key; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trusted_key ("sourceId", kid, data, "createdAt") FROM stdin;
\.


--
-- Data for Name: trusted_key_source; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trusted_key_source (id, type, config, status, "lastError", "lastRefreshedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."user" (id, email, "firstName", "lastName", password, "personalizationAnswers", "createdAt", "updatedAt", settings, disabled, "mfaEnabled", "mfaSecret", "mfaRecoveryCodes", "lastActiveAt", "roleSlug") FROM stdin;
f533e7c0-27a9-4b00-adbb-44b596191384	iamthatchavit@gmail.com	Thatchavit	Thaveechaiyagarn	$2a$10$4XotsdiMFsfkQi33MDiHXO5w2jA6OSfYwa4/vL9Xy7xU./cSxtfRW	{"version":"v4","personalization_survey_submitted_at":"2026-06-30T16:33:45.372Z","personalization_survey_n8n_version":"2.28.3","automationGoalDevops":["cloud-infrastructure-orchestration","ci-cd"],"companySize":"<20","companyType":"saas","role":"engineering","reportedSource":"youtube"}	2026-06-30 16:29:53.384+00	2026-07-01 18:40:35.858+00	{"userActivated":true,"firstSuccessfulWorkflowId":"Si28JZdUotdLzill","userActivatedAt":1782894638058}	f	f	\N	\N	2026-07-02	global:owner
\.


--
-- Data for Name: user_api_keys; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_api_keys (id, "userId", label, "apiKey", "createdAt", "updatedAt", scopes, audience, "lastUsedAt") FROM stdin;
\.


--
-- Data for Name: user_favorites; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_favorites (id, "userId", "resourceId", "resourceType") FROM stdin;
\.


--
-- Data for Name: variables; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.variables (key, type, value, id, "projectId") FROM stdin;
\.


--
-- Data for Name: webhook_entity; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.webhook_entity ("webhookPath", method, node, "webhookId", "pathLength", "workflowId") FROM stdin;
\.


--
-- Data for Name: workflow_builder_session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.workflow_builder_session (id, "workflowId", "userId", messages, "previousSummary", "createdAt", "updatedAt", "activeVersionCardId", "resumeAfterRestoreMessageId") FROM stdin;
\.


--
-- Data for Name: workflow_dependency; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.workflow_dependency (id, "workflowId", "workflowVersionId", "dependencyType", "dependencyKey", "dependencyInfo", "indexVersionId", "createdAt", "publishedVersionId") FROM stdin;
76	Si28JZdUotdLzill	31	nodeType	n8n-nodes-base.scheduleTrigger	{"nodeId":"4d97a057-af28-44e3-811e-73245c7bad6f","nodeVersion":1.3}	1	2026-07-01 08:08:11.483+00	\N
77	Si28JZdUotdLzill	31	nodeType	n8n-nodes-base.httpRequest	{"nodeId":"c38b27ff-6b94-479f-be61-d469406da108","nodeVersion":4.4}	1	2026-07-01 08:08:11.483+00	\N
78	Si28JZdUotdLzill	31	nodeType	n8n-nodes-base.splitOut	{"nodeId":"f651649f-6ad9-469a-8e30-d402c1161e39","nodeVersion":1}	1	2026-07-01 08:08:11.483+00	\N
79	Si28JZdUotdLzill	31	nodeType	n8n-nodes-base.httpRequest	{"nodeId":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","nodeVersion":4.4}	1	2026-07-01 08:08:11.483+00	\N
80	Si28JZdUotdLzill	31	nodeType	n8n-nodes-base.scheduleTrigger	{"nodeId":"4d97a057-af28-44e3-811e-73245c7bad6f","nodeVersion":1.3}	1	2026-07-01 08:22:54.667+00	958f9d58-aa29-4953-914f-a5f61de89b26
81	Si28JZdUotdLzill	31	nodeType	n8n-nodes-base.httpRequest	{"nodeId":"c38b27ff-6b94-479f-be61-d469406da108","nodeVersion":4.4}	1	2026-07-01 08:22:54.667+00	958f9d58-aa29-4953-914f-a5f61de89b26
82	Si28JZdUotdLzill	31	nodeType	n8n-nodes-base.splitOut	{"nodeId":"f651649f-6ad9-469a-8e30-d402c1161e39","nodeVersion":1}	1	2026-07-01 08:22:54.667+00	958f9d58-aa29-4953-914f-a5f61de89b26
83	Si28JZdUotdLzill	31	nodeType	n8n-nodes-base.httpRequest	{"nodeId":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","nodeVersion":4.4}	1	2026-07-01 08:22:54.667+00	958f9d58-aa29-4953-914f-a5f61de89b26
\.


--
-- Data for Name: workflow_entity; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.workflow_entity (name, active, nodes, connections, "createdAt", "updatedAt", settings, "staticData", "pinData", "versionId", "triggerCount", id, meta, "parentFolderId", "isArchived", "versionCounter", description, "activeVersionId", "nodeGroups", "sourceWorkflowId") FROM stdin;
content post	t	[{"parameters":{"rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"url":"http://app:3000/api/content/scheduled","sendHeaders":true,"headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"options":{}},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"fieldToSplitOut":"items","options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"},{"parameters":{"method":"PATCH","url":"=\\t http://app:3000/api/content/{{ $json.id }}","sendHeaders":true,"headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":true,"bodyParameters":{"parameters":[{"name":"status","value":"posted"}]},"options":{}},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[672,0],"id":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","name":"HTTP Request1"}]	{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]},"Split Out":{"main":[[{"node":"HTTP Request1","type":"main","index":0}]]}}	2026-06-30 16:42:09.002+00	2026-07-01 08:08:11.461+00	{"executionOrder":"v1","binaryMode":"separate","availableInMCP":false}	{"node:Schedule Trigger":{"recurrenceRules":[]}}	{}	958f9d58-aa29-4953-914f-a5f61de89b26	1	Si28JZdUotdLzill	\N	\N	f	31	\N	958f9d58-aa29-4953-914f-a5f61de89b26	[]	\N
\.


--
-- Data for Name: workflow_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.workflow_history ("versionId", "workflowId", authors, "createdAt", "updatedAt", nodes, connections, name, autosaved, description, "nodeGroups") FROM stdin;
4a87fecc-e59e-445d-89f6-5dd1afd9a5fc	Si28JZdUotdLzill	Thatchavit Thaveechaiyagarn	2026-07-01 07:41:53.233+00	2026-07-01 07:41:53.233+00	[{"parameters":{"rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"url":"http://app:3000/api/content/scheduled","options":{}},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[144,32],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"}]	{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]}}	\N	t	\N	[]
ae15b376-9e49-452a-a005-f391d6f8b105	Si28JZdUotdLzill	Thatchavit Thaveechaiyagarn	2026-07-01 07:48:14.211+00	2026-07-01 07:48:14.211+00	[{"parameters":{"rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"url":"http://app:3000/api/content/scheduled","sendHeaders":true,"headerParameters":{"parameters":[{}]},"options":{}},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[144,32],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"}]	{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]}}	\N	t	\N	[]
9ef9e31c-1d8f-4cd3-a14a-4dfbeb29ebb6	Si28JZdUotdLzill	Thatchavit Thaveechaiyagarn	2026-07-01 07:48:15.945+00	2026-07-01 07:48:15.945+00	[{"parameters":{"rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"url":"http://app:3000/api/content/scheduled","sendQuery":true,"queryParameters":{"parameters":[{}]},"sendHeaders":true,"headerParameters":{"parameters":[{}]},"options":{}},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[144,32],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"}]	{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]}}	\N	t	\N	[]
13a6e811-873a-4b59-b64a-2bfe98a7ceb2	Si28JZdUotdLzill	Thatchavit Thaveechaiyagarn	2026-07-01 07:48:19.511+00	2026-07-01 07:48:19.511+00	[{"parameters":{"rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"url":"http://app:3000/api/content/scheduled","sendQuery":true,"queryParameters":{"parameters":[{}]},"sendHeaders":true,"headerParameters":{"parameters":[{}]},"sendBody":true,"bodyParameters":{"parameters":[{}]},"options":{}},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[144,32],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"}]	{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]}}	\N	t	\N	[]
a5ec90a2-ebca-4ab6-a870-fd22d58c1868	Si28JZdUotdLzill	Thatchavit Thaveechaiyagarn	2026-07-01 07:49:59.337+00	2026-07-01 07:49:59.337+00	[{"parameters":{"rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"url":"http://app:3000/api/content/scheduled","sendQuery":true,"queryParameters":{"parameters":[{"name":"x-api-key"}]},"sendHeaders":true,"headerParameters":{"parameters":[{}]},"sendBody":true,"bodyParameters":{"parameters":[{}]},"options":{}},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[144,32],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"}]	{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]}}	\N	t	\N	[]
e2d64ee9-a9fb-4a64-a972-8c23ce182ce8	Si28JZdUotdLzill	Thatchavit Thaveechaiyagarn	2026-07-01 07:50:55.758+00	2026-07-01 07:50:55.758+00	[{"parameters":{"rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"url":"http://app:3000/api/content/scheduled","sendQuery":true,"queryParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendHeaders":true,"headerParameters":{"parameters":[{}]},"sendBody":true,"bodyParameters":{"parameters":[{}]},"options":{}},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[144,32],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"}]	{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]}}	\N	t	\N	[]
5f7eff27-4d88-4438-88e3-27c09a182ee0	Si28JZdUotdLzill	Thatchavit Thaveechaiyagarn	2026-07-01 07:51:08.321+00	2026-07-01 07:51:08.321+00	[{"parameters":{"rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"url":"http://app:3000/api/content/scheduled","sendQuery":true,"queryParameters":{"parameters":[{"value":"dev-n8n-api-key-change-in-production"}]},"sendHeaders":true,"headerParameters":{"parameters":[{}]},"sendBody":true,"bodyParameters":{"parameters":[{}]},"options":{}},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[144,32],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"}]	{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]}}	\N	t	\N	[]
a9d7d13c-cc5f-4420-afb3-66473777b1e1	Si28JZdUotdLzill	Thatchavit Thaveechaiyagarn	2026-07-01 07:51:10.323+00	2026-07-01 07:51:10.323+00	[{"parameters":{"rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"url":"http://app:3000/api/content/scheduled","sendQuery":true,"queryParameters":{"parameters":[{"value":"dev-n8n-api-key-change-in-production"}]},"sendHeaders":true,"headerParameters":{"parameters":[{"name":"x-api-key"}]},"sendBody":true,"bodyParameters":{"parameters":[{}]},"options":{}},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[144,32],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"}]	{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]}}	\N	t	\N	[]
42014348-559d-473d-b34c-4b28dd843f28	Si28JZdUotdLzill	Thatchavit Thaveechaiyagarn	2026-07-01 07:51:13.8+00	2026-07-01 07:51:13.8+00	[{"parameters":{"rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"url":"http://app:3000/api/content/scheduled","sendQuery":true,"queryParameters":{"parameters":[{}]},"sendHeaders":true,"headerParameters":{"parameters":[{"name":"x-api-key"}]},"sendBody":true,"bodyParameters":{"parameters":[{}]},"options":{}},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[144,32],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"}]	{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]}}	\N	t	\N	[]
68b7b952-1771-4ac4-bb43-529fd7c334fc	Si28JZdUotdLzill	Thatchavit Thaveechaiyagarn	2026-07-01 07:51:15.521+00	2026-07-01 07:51:15.521+00	[{"parameters":{"rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"url":"http://app:3000/api/content/scheduled","sendQuery":true,"queryParameters":{"parameters":[{}]},"sendHeaders":true,"headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":true,"bodyParameters":{"parameters":[{}]},"options":{}},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[144,32],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"}]	{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]}}	\N	t	\N	[]
93048805-a593-4561-84fc-1c1a80f83db7	Si28JZdUotdLzill	Thatchavit Thaveechaiyagarn	2026-07-01 07:51:28.353+00	2026-07-01 07:51:28.353+00	[{"parameters":{"rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"url":"http://app:3000/api/content/scheduled","sendHeaders":true,"headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":true,"bodyParameters":{"parameters":[{}]},"options":{}},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[144,32],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"}]	{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]}}	\N	t	\N	[]
70affbaf-5d50-483f-b8fa-c2fda4425302	Si28JZdUotdLzill	Thatchavit Thaveechaiyagarn	2026-07-01 07:59:04.914+00	2026-07-01 07:59:04.914+00	[{"parameters":{"rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"url":"http://app:3000/api/content/scheduled","sendHeaders":true,"headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"options":{}},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"}]	{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]}}	\N	t	\N	[]
1a9c5ece-80fa-44f0-983e-630a04c82a65	Si28JZdUotdLzill	Thatchavit Thaveechaiyagarn	2026-07-01 08:00:44.004+00	2026-07-01 08:00:44.004+00	[{"parameters":{"rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"url":"http://app:3000/api/content/scheduled","sendHeaders":true,"headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"options":{}},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"fieldToSplitOut":"items","options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"},{"parameters":{"options":{}},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[672,0],"id":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","name":"HTTP Request1"}]	{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]},"Split Out":{"main":[[{"node":"HTTP Request1","type":"main","index":0}]]}}	\N	t	\N	[]
2dc164f6-4800-4914-a7fa-7ea9d859aaaa	Si28JZdUotdLzill	Thatchavit Thaveechaiyagarn	2026-07-01 08:00:46.798+00	2026-07-01 08:00:46.798+00	[{"parameters":{"rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"url":"http://app:3000/api/content/scheduled","sendHeaders":true,"headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"options":{}},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"fieldToSplitOut":"items","options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"},{"parameters":{"method":"PATCH","options":{}},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[672,0],"id":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","name":"HTTP Request1"}]	{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]},"Split Out":{"main":[[{"node":"HTTP Request1","type":"main","index":0}]]}}	\N	t	\N	[]
bf002be1-9231-41f0-8840-61fc72eceb59	Si28JZdUotdLzill	Thatchavit Thaveechaiyagarn	2026-07-01 08:02:13.12+00	2026-07-01 08:02:13.12+00	[{"parameters":{"rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"url":"http://app:3000/api/content/scheduled","sendHeaders":true,"headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"options":{}},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"fieldToSplitOut":"items","options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"},{"parameters":{"method":"PATCH","url":"=\\t http://app:3000/api/content/{{ $json.id }}","options":{}},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[672,0],"id":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","name":"HTTP Request1"}]	{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]},"Split Out":{"main":[[{"node":"HTTP Request1","type":"main","index":0}]]}}	\N	t	\N	[]
bb020967-4c5d-4753-80c1-c9e79f948a4b	Si28JZdUotdLzill	Thatchavit Thaveechaiyagarn	2026-07-01 08:02:51.953+00	2026-07-01 08:02:51.953+00	[{"parameters":{"rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"url":"http://app:3000/api/content/scheduled","sendHeaders":true,"headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"options":{}},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"fieldToSplitOut":"items","options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"},{"parameters":{"method":"PATCH","url":"=\\t http://app:3000/api/content/{{ $json.id }}","sendBody":true,"bodyParameters":{"parameters":[{}]},"options":{}},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[672,0],"id":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","name":"HTTP Request1"}]	{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]},"Split Out":{"main":[[{"node":"HTTP Request1","type":"main","index":0}]]}}	\N	t	\N	[]
ed9a9dbd-44d7-43d2-8bc1-59f25baf4e58	Si28JZdUotdLzill	Thatchavit Thaveechaiyagarn	2026-07-01 08:02:54.478+00	2026-07-01 08:02:54.478+00	[{"parameters":{"rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"url":"http://app:3000/api/content/scheduled","sendHeaders":true,"headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"options":{}},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"fieldToSplitOut":"items","options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"},{"parameters":{"method":"PATCH","url":"=\\t http://app:3000/api/content/{{ $json.id }}","sendHeaders":true,"headerParameters":{"parameters":[{}]},"sendBody":true,"bodyParameters":{"parameters":[{}]},"options":{}},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[672,0],"id":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","name":"HTTP Request1"}]	{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]},"Split Out":{"main":[[{"node":"HTTP Request1","type":"main","index":0}]]}}	\N	t	\N	[]
47b02767-d87f-4eb5-a55b-6a384067a830	Si28JZdUotdLzill	Thatchavit Thaveechaiyagarn	2026-07-01 08:03:09.797+00	2026-07-01 08:03:09.797+00	[{"parameters":{"rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"url":"http://app:3000/api/content/scheduled","sendHeaders":true,"headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"options":{}},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"fieldToSplitOut":"items","options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"},{"parameters":{"method":"PATCH","url":"=\\t http://app:3000/api/content/{{ $json.id }}","sendHeaders":true,"headerParameters":{"parameters":[{"name":"x-api-key"}]},"sendBody":true,"bodyParameters":{"parameters":[{}]},"options":{}},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[672,0],"id":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","name":"HTTP Request1"}]	{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]},"Split Out":{"main":[[{"node":"HTTP Request1","type":"main","index":0}]]}}	\N	t	\N	[]
2da83105-e7bd-4123-bf99-a5917e9669c5	Si28JZdUotdLzill	Thatchavit Thaveechaiyagarn	2026-07-01 08:03:18.331+00	2026-07-01 08:03:18.331+00	[{"parameters":{"rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"url":"http://app:3000/api/content/scheduled","sendHeaders":true,"headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"options":{}},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"fieldToSplitOut":"items","options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"},{"parameters":{"method":"PATCH","url":"=\\t http://app:3000/api/content/{{ $json.id }}","sendHeaders":true,"headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":true,"bodyParameters":{"parameters":[{}]},"options":{}},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[672,0],"id":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","name":"HTTP Request1"}]	{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]},"Split Out":{"main":[[{"node":"HTTP Request1","type":"main","index":0}]]}}	\N	t	\N	[]
830531f4-1196-46de-be11-31d5a6ea79e7	Si28JZdUotdLzill	Thatchavit Thaveechaiyagarn	2026-07-01 08:03:33.993+00	2026-07-01 08:03:33.993+00	[{"parameters":{"rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"url":"http://app:3000/api/content/scheduled","sendHeaders":true,"headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"options":{}},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"fieldToSplitOut":"items","options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"},{"parameters":{"method":"PATCH","url":"=\\t http://app:3000/api/content/{{ $json.id }}","sendHeaders":true,"headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":true,"bodyParameters":{"parameters":[{"name":"{ \\"status\\": \\"posted\\" }"}]},"options":{}},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[672,0],"id":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","name":"HTTP Request1"}]	{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]},"Split Out":{"main":[[{"node":"HTTP Request1","type":"main","index":0}]]}}	\N	t	\N	[]
0f2bda44-493a-4b15-892c-628a68e8804d	Si28JZdUotdLzill	Thatchavit Thaveechaiyagarn	2026-07-01 08:03:36.127+00	2026-07-01 08:03:36.127+00	[{"parameters":{"rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"url":"http://app:3000/api/content/scheduled","sendHeaders":true,"headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"options":{}},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"fieldToSplitOut":"items","options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"},{"parameters":{"method":"PATCH","url":"=\\t http://app:3000/api/content/{{ $json.id }}","sendHeaders":true,"headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":true,"bodyParameters":{"parameters":[{}]},"options":{}},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[672,0],"id":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","name":"HTTP Request1"}]	{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]},"Split Out":{"main":[[{"node":"HTTP Request1","type":"main","index":0}]]}}	\N	t	\N	[]
958f9d58-aa29-4953-914f-a5f61de89b26	Si28JZdUotdLzill	Thatchavit Thaveechaiyagarn	2026-07-01 08:08:11.462+00	2026-07-01 08:22:54.667+00	[{"parameters":{"rule":{"interval":[{"field":"minutes","minutesInterval":15}]}},"type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.3,"position":[0,0],"id":"4d97a057-af28-44e3-811e-73245c7bad6f","name":"Schedule Trigger"},{"parameters":{"url":"http://app:3000/api/content/scheduled","sendHeaders":true,"headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"options":{}},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[256,0],"id":"c38b27ff-6b94-479f-be61-d469406da108","name":"HTTP Request"},{"parameters":{"fieldToSplitOut":"items","options":{}},"type":"n8n-nodes-base.splitOut","typeVersion":1,"position":[464,0],"id":"f651649f-6ad9-469a-8e30-d402c1161e39","name":"Split Out"},{"parameters":{"method":"PATCH","url":"=\\t http://app:3000/api/content/{{ $json.id }}","sendHeaders":true,"headerParameters":{"parameters":[{"name":"x-api-key","value":"dev-n8n-api-key-change-in-production"}]},"sendBody":true,"bodyParameters":{"parameters":[{"name":"status","value":"posted"}]},"options":{}},"type":"n8n-nodes-base.httpRequest","typeVersion":4.4,"position":[672,0],"id":"e6ed8aba-500a-4da6-833a-bb9592e2fd0e","name":"HTTP Request1"}]	{"Schedule Trigger":{"main":[[{"node":"HTTP Request","type":"main","index":0}]]},"HTTP Request":{"main":[[{"node":"Split Out","type":"main","index":0}]]},"Split Out":{"main":[[{"node":"HTTP Request1","type":"main","index":0}]]}}	v1 - auto-post scheduled content	t		[]
\.


--
-- Data for Name: workflow_publication_outbox; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.workflow_publication_outbox (id, "workflowId", "publishedVersionId", status, "errorMessage", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: workflow_publish_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.workflow_publish_history (id, "workflowId", "versionId", event, "userId", "createdAt") FROM stdin;
1	Si28JZdUotdLzill	958f9d58-aa29-4953-914f-a5f61de89b26	activated	f533e7c0-27a9-4b00-adbb-44b596191384	2026-07-01 08:22:54.664+00
\.


--
-- Data for Name: workflow_published_version; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.workflow_published_version ("workflowId", "publishedVersionId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: workflow_statistics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.workflow_statistics (count, "latestEvent", name, "workflowId", "rootCount", id, "workflowName") FROM stdin;
1	2026-07-01 07:51:45.463+00	data_loaded	Si28JZdUotdLzill	1	4	\N
4	2026-07-01 08:16:06.366+00	manual_error	Si28JZdUotdLzill	0	7	content post
7	2026-07-01 08:18:30.038+00	manual_success	Si28JZdUotdLzill	0	1	content post
24	2026-07-01 16:30:38.127+00	production_error	Si28JZdUotdLzill	24	22	content post
18	2026-07-02 05:00:38.117+00	production_success	Si28JZdUotdLzill	18	13	content post
\.


--
-- Data for Name: workflows_tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.workflows_tags ("workflowId", "tagId") FROM stdin;
\.


--
-- Name: auth_provider_sync_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_provider_sync_history_id_seq', 1, false);


--
-- Name: credential_dependency_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.credential_dependency_id_seq', 1, false);


--
-- Name: execution_annotations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.execution_annotations_id_seq', 1, false);


--
-- Name: execution_entity_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.execution_entity_id_seq', 53, true);


--
-- Name: execution_metadata_temp_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.execution_metadata_temp_id_seq', 1, false);


--
-- Name: insights_by_period_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.insights_by_period_id_seq', 54, true);


--
-- Name: insights_metadata_metaId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."insights_metadata_metaId_seq"', 2, true);


--
-- Name: insights_raw_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.insights_raw_id_seq', 102, true);


--
-- Name: instance_version_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.instance_version_history_id_seq', 1, true);


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.migrations_id_seq', 212, true);


--
-- Name: oauth_user_consents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.oauth_user_consents_id_seq', 1, false);


--
-- Name: secrets_provider_connection_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.secrets_provider_connection_id_seq', 1, false);


--
-- Name: user_favorites_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_favorites_id_seq', 1, false);


--
-- Name: workflow_dependency_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.workflow_dependency_id_seq', 83, true);


--
-- Name: workflow_publication_outbox_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.workflow_publication_outbox_id_seq', 1, false);


--
-- Name: workflow_publish_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.workflow_publish_history_id_seq', 1, true);


--
-- Name: workflow_statistics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.workflow_statistics_id_seq', 54, true);


--
-- Name: test_run PK_011c050f566e9db509a0fadb9b9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_run
    ADD CONSTRAINT "PK_011c050f566e9db509a0fadb9b9" PRIMARY KEY (id);


--
-- Name: project_secrets_provider_access PK_0402b7fcec5415246656f102f83; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_secrets_provider_access
    ADD CONSTRAINT "PK_0402b7fcec5415246656f102f83" PRIMARY KEY ("secretsProviderConnectionId", "projectId");


--
-- Name: installed_packages PK_08cc9197c39b028c1e9beca225940576fd1a5804; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.installed_packages
    ADD CONSTRAINT "PK_08cc9197c39b028c1e9beca225940576fd1a5804" PRIMARY KEY ("packageName");


--
-- Name: instance_ai_run_snapshots PK_0a5fc9690a84950ebf1416fb146; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instance_ai_run_snapshots
    ADD CONSTRAINT "PK_0a5fc9690a84950ebf1416fb146" PRIMARY KEY ("threadId", "runId");


--
-- Name: mcp_registry_server PK_12fd89a1fb8489513b0a91f5d31; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mcp_registry_server
    ADD CONSTRAINT "PK_12fd89a1fb8489513b0a91f5d31" PRIMARY KEY (slug);


--
-- Name: instance_ai_messages PK_156c6f287225e9befe0181bb02b; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instance_ai_messages
    ADD CONSTRAINT "PK_156c6f287225e9befe0181bb02b" PRIMARY KEY (id);


--
-- Name: agent_task_definition PK_1756c11c637903e97629a7a784a; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agent_task_definition
    ADD CONSTRAINT "PK_1756c11c637903e97629a7a784a" PRIMARY KEY (id);


--
-- Name: execution_metadata PK_17a0b6284f8d626aae88e1c16e4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.execution_metadata
    ADD CONSTRAINT "PK_17a0b6284f8d626aae88e1c16e4" PRIMARY KEY (id);


--
-- Name: role_mapping_rule_project PK_198c5b5aea509d139274efcaf9a; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_mapping_rule_project
    ADD CONSTRAINT "PK_198c5b5aea509d139274efcaf9a" PRIMARY KEY ("roleMappingRuleId", "projectId");


--
-- Name: project_relation PK_1caaa312a5d7184a003be0f0cb6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_relation
    ADD CONSTRAINT "PK_1caaa312a5d7184a003be0f0cb6" PRIMARY KEY ("projectId", "userId");


--
-- Name: chat_hub_sessions PK_1eafef1273c70e4464fec703412; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_hub_sessions
    ADD CONSTRAINT "PK_1eafef1273c70e4464fec703412" PRIMARY KEY (id);


--
-- Name: agent_task_snapshot PK_2142a8bcda2360c3c5e34f82640; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agent_task_snapshot
    ADD CONSTRAINT "PK_2142a8bcda2360c3c5e34f82640" PRIMARY KEY ("versionId", "taskId");


--
-- Name: instance_ai_iteration_logs PK_21c2b214b44bc6c34a6d3551c90; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instance_ai_iteration_logs
    ADD CONSTRAINT "PK_21c2b214b44bc6c34a6d3551c90" PRIMARY KEY (id);


--
-- Name: agent_execution_threads PK_22373dbf6ba6929d8ac50093309; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agent_execution_threads
    ADD CONSTRAINT "PK_22373dbf6ba6929d8ac50093309" PRIMARY KEY (id);


--
-- Name: instance_ai_pending_confirmations PK_25c38179c8d45095b168adfff80; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instance_ai_pending_confirmations
    ADD CONSTRAINT "PK_25c38179c8d45095b168adfff80" PRIMARY KEY ("requestId");


--
-- Name: agents_memory_entry_sources PK_278f05e98e74baaaa93f52b4bab; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agents_memory_entry_sources
    ADD CONSTRAINT "PK_278f05e98e74baaaa93f52b4bab" PRIMARY KEY (id);


--
-- Name: folder_tag PK_27e4e00852f6b06a925a4d83a3e; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.folder_tag
    ADD CONSTRAINT "PK_27e4e00852f6b06a925a4d83a3e" PRIMARY KEY ("folderId", "tagId");


--
-- Name: instance_ai_threads PK_35575100e45cdedeb89ae0643e9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instance_ai_threads
    ADD CONSTRAINT "PK_35575100e45cdedeb89ae0643e9" PRIMARY KEY (id);


--
-- Name: role PK_35c9b140caaf6da09cfabb0d675; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role
    ADD CONSTRAINT "PK_35c9b140caaf6da09cfabb0d675" PRIMARY KEY (slug);


--
-- Name: secrets_provider_connection PK_4350ae85e76f9ba7df1370acb5d; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.secrets_provider_connection
    ADD CONSTRAINT "PK_4350ae85e76f9ba7df1370acb5d" PRIMARY KEY (id);


--
-- Name: instance_ai_resources PK_45b5b0b6f715dae4292b86603d8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instance_ai_resources
    ADD CONSTRAINT "PK_45b5b0b6f715dae4292b86603d8" PRIMARY KEY (id);


--
-- Name: agents_threads PK_4a3feb0a13ffe315c009cce64e5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agents_threads
    ADD CONSTRAINT "PK_4a3feb0a13ffe315c009cce64e5" PRIMARY KEY (id);


--
-- Name: project PK_4d68b1358bb5b766d3e78f32f57; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project
    ADD CONSTRAINT "PK_4d68b1358bb5b766d3e78f32f57" PRIMARY KEY (id);


--
-- Name: instance_ai_observations PK_4d9b514cdf0f0b577650caf2ac2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instance_ai_observations
    ADD CONSTRAINT "PK_4d9b514cdf0f0b577650caf2ac2" PRIMARY KEY (id);


--
-- Name: agent_checkpoints PK_50a27cbafa6806c9b162304b5fd; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agent_checkpoints
    ADD CONSTRAINT "PK_50a27cbafa6806c9b162304b5fd" PRIMARY KEY ("runId");


--
-- Name: dynamic_credential_entry PK_5135ffcabecad4727ff6b9b803d; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dynamic_credential_entry
    ADD CONSTRAINT "PK_5135ffcabecad4727ff6b9b803d" PRIMARY KEY (credential_id, subject_id, resolver_id);


--
-- Name: workflow_dependency PK_52325e34cd7a2f0f67b0f3cad65; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_dependency
    ADD CONSTRAINT "PK_52325e34cd7a2f0f67b0f3cad65" PRIMARY KEY (id);


--
-- Name: instance_ai_checkpoints PK_5315a45f0846d1f9d128c18a2ed; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instance_ai_checkpoints
    ADD CONSTRAINT "PK_5315a45f0846d1f9d128c18a2ed" PRIMARY KEY (key);


--
-- Name: instance_ai_thread_grants PK_56107d26ebeabf780c5cf311d66; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instance_ai_thread_grants
    ADD CONSTRAINT "PK_56107d26ebeabf780c5cf311d66" PRIMARY KEY ("threadId", "userId", "grantKey");


--
-- Name: invalid_auth_token PK_5779069b7235b256d91f7af1a15; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invalid_auth_token
    ADD CONSTRAINT "PK_5779069b7235b256d91f7af1a15" PRIMARY KEY (token);


--
-- Name: evaluation_config PK_59c14dccf8989df94070c2dcfda; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluation_config
    ADD CONSTRAINT "PK_59c14dccf8989df94070c2dcfda" PRIMARY KEY (id);


--
-- Name: instance_ai_observation_cursors PK_5b6319b2e9a37c1064a72428f9a; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instance_ai_observation_cursors
    ADD CONSTRAINT "PK_5b6319b2e9a37c1064a72428f9a" PRIMARY KEY ("observationScopeId");


--
-- Name: shared_workflow PK_5ba87620386b847201c9531c58f; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shared_workflow
    ADD CONSTRAINT "PK_5ba87620386b847201c9531c58f" PRIMARY KEY ("workflowId", "projectId");


--
-- Name: workflow_published_version PK_5c76fb7ee939fe2530374d3f75a; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_published_version
    ADD CONSTRAINT "PK_5c76fb7ee939fe2530374d3f75a" PRIMARY KEY ("workflowId");


--
-- Name: folder PK_6278a41a706740c94c02e288df8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.folder
    ADD CONSTRAINT "PK_6278a41a706740c94c02e288df8" PRIMARY KEY (id);


--
-- Name: agent_history PK_65ffcfe7a8e112fb826311fb092; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agent_history
    ADD CONSTRAINT "PK_65ffcfe7a8e112fb826311fb092" PRIMARY KEY ("versionId");


--
-- Name: data_table_column PK_673cb121ee4a8a5e27850c72c51; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.data_table_column
    ADD CONSTRAINT "PK_673cb121ee4a8a5e27850c72c51" PRIMARY KEY (id);


--
-- Name: agent_files PK_692920e59217af7d124cd95106f; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agent_files
    ADD CONSTRAINT "PK_692920e59217af7d124cd95106f" PRIMARY KEY (id);


--
-- Name: chat_hub_tools PK_696d26426c704fba79b2c195ef5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_hub_tools
    ADD CONSTRAINT "PK_696d26426c704fba79b2c195ef5" PRIMARY KEY (id);


--
-- Name: annotation_tag_entity PK_69dfa041592c30bbc0d4b84aa00; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.annotation_tag_entity
    ADD CONSTRAINT "PK_69dfa041592c30bbc0d4b84aa00" PRIMARY KEY (id);


--
-- Name: user_favorites PK_6c472a19a7423cfbbf6b7c75939; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_favorites
    ADD CONSTRAINT "PK_6c472a19a7423cfbbf6b7c75939" PRIMARY KEY (id);


--
-- Name: instance_ai_observational_memory PK_7192dd00cddba039bf1d3e6a098; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instance_ai_observational_memory
    ADD CONSTRAINT "PK_7192dd00cddba039bf1d3e6a098" PRIMARY KEY (id);


--
-- Name: oauth_refresh_tokens PK_74abaed0b30711b6532598b0392; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.oauth_refresh_tokens
    ADD CONSTRAINT "PK_74abaed0b30711b6532598b0392" PRIMARY KEY (token);


--
-- Name: dynamic_credential_user_entry PK_74f548e633abc66dc27c8f0ca77; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dynamic_credential_user_entry
    ADD CONSTRAINT "PK_74f548e633abc66dc27c8f0ca77" PRIMARY KEY ("credentialId", "userId", "resolverId");


--
-- Name: agent_chat_subscriptions PK_76598cf91038bee1f3ac94c94bc; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agent_chat_subscriptions
    ADD CONSTRAINT "PK_76598cf91038bee1f3ac94c94bc" PRIMARY KEY ("agentId", "integrationType", "credentialId", "threadId");


--
-- Name: chat_hub_messages PK_7704a5add6baed43eef835f0bfb; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_hub_messages
    ADD CONSTRAINT "PK_7704a5add6baed43eef835f0bfb" PRIMARY KEY (id);


--
-- Name: execution_annotations PK_7afcf93ffa20c4252869a7c6a23; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.execution_annotations
    ADD CONSTRAINT "PK_7afcf93ffa20c4252869a7c6a23" PRIMARY KEY (id);


--
-- Name: agents_observation_locks PK_7e2e315162ac3d80587e15ac2c3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agents_observation_locks
    ADD CONSTRAINT "PK_7e2e315162ac3d80587e15ac2c3" PRIMARY KEY ("agentId", "observationScopeId", "taskKind");


--
-- Name: credential_dependency PK_80212729ed0ffa0709417ab28f4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credential_dependency
    ADD CONSTRAINT "PK_80212729ed0ffa0709417ab28f4" PRIMARY KEY (id);


--
-- Name: agents_messages PK_81020dc608dfb0af1ede386d907; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agents_messages
    ADD CONSTRAINT "PK_81020dc608dfb0af1ede386d907" PRIMARY KEY (id);


--
-- Name: ai_builder_temporary_workflow PK_85a87a1ba0f61999fe11dc56325; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_builder_temporary_workflow
    ADD CONSTRAINT "PK_85a87a1ba0f61999fe11dc56325" PRIMARY KEY ("workflowId");


--
-- Name: oauth_user_consents PK_85b9ada746802c8993103470f05; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.oauth_user_consents
    ADD CONSTRAINT "PK_85b9ada746802c8993103470f05" PRIMARY KEY (id);


--
-- Name: instance_version_history PK_874f58cb616935bf49d9dbd67e9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instance_version_history
    ADD CONSTRAINT "PK_874f58cb616935bf49d9dbd67e9" PRIMARY KEY (id);


--
-- Name: chat_hub_session_tools PK_87aea76ff4c274c4a5ac838ebe3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_hub_session_tools
    ADD CONSTRAINT "PK_87aea76ff4c274c4a5ac838ebe3" PRIMARY KEY ("sessionId", "toolId");


--
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);


--
-- Name: installed_nodes PK_8ebd28194e4f792f96b5933423fc439df97d9689; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.installed_nodes
    ADD CONSTRAINT "PK_8ebd28194e4f792f96b5933423fc439df97d9689" PRIMARY KEY (name);


--
-- Name: shared_credentials PK_8ef3a59796a228913f251779cff; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shared_credentials
    ADD CONSTRAINT "PK_8ef3a59796a228913f251779cff" PRIMARY KEY ("credentialsId", "projectId");


--
-- Name: test_case_execution PK_90c121f77a78a6580e94b794bce; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_case_execution
    ADD CONSTRAINT "PK_90c121f77a78a6580e94b794bce" PRIMARY KEY (id);


--
-- Name: instance_ai_workflow_snapshots PK_93f2696eb321dfe1d7defe7073f; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instance_ai_workflow_snapshots
    ADD CONSTRAINT "PK_93f2696eb321dfe1d7defe7073f" PRIMARY KEY ("runId", "workflowName");


--
-- Name: deployment_key PK_94bb7aeb5def5a0284a5fe9f9a0; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deployment_key
    ADD CONSTRAINT "PK_94bb7aeb5def5a0284a5fe9f9a0" PRIMARY KEY (id);


--
-- Name: user_api_keys PK_978fa5caa3468f463dac9d92e69; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_api_keys
    ADD CONSTRAINT "PK_978fa5caa3468f463dac9d92e69" PRIMARY KEY (id);


--
-- Name: execution_annotation_tags PK_979ec03d31294cca484be65d11f; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.execution_annotation_tags
    ADD CONSTRAINT "PK_979ec03d31294cca484be65d11f" PRIMARY KEY ("annotationId", "tagId");


--
-- Name: trusted_key_source PK_99e8908ce2c2cdccce487db7fc6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trusted_key_source
    ADD CONSTRAINT "PK_99e8908ce2c2cdccce487db7fc6" PRIMARY KEY (id);


--
-- Name: agents_observations PK_9ad319654d12c2649f7caf27135; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agents_observations
    ADD CONSTRAINT "PK_9ad319654d12c2649f7caf27135" PRIMARY KEY (id);


--
-- Name: agents PK_9c653f28ae19c5884d5baf6a1d9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agents
    ADD CONSTRAINT "PK_9c653f28ae19c5884d5baf6a1d9" PRIMARY KEY (id);


--
-- Name: agents_memory_entry_locks PK_a8e0f570d04a174292bea104ae6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agents_memory_entry_locks
    ADD CONSTRAINT "PK_a8e0f570d04a174292bea104ae6" PRIMARY KEY ("agentId", "resourceId");


--
-- Name: webhook_entity PK_b21ace2e13596ccd87dc9bf4ea6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.webhook_entity
    ADD CONSTRAINT "PK_b21ace2e13596ccd87dc9bf4ea6" PRIMARY KEY ("webhookPath", method);


--
-- Name: agents_memory_entry_cursors PK_b31a1d5c009a27f4cc5ef8f102a; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agents_memory_entry_cursors
    ADD CONSTRAINT "PK_b31a1d5c009a27f4cc5ef8f102a" PRIMARY KEY ("agentId", "observationScopeId");


--
-- Name: workflow_publication_outbox PK_b3e2eeee36a4bd044d56468d311; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_publication_outbox
    ADD CONSTRAINT "PK_b3e2eeee36a4bd044d56468d311" PRIMARY KEY (id);


--
-- Name: insights_by_period PK_b606942249b90cc39b0265f0575; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.insights_by_period
    ADD CONSTRAINT "PK_b606942249b90cc39b0265f0575" PRIMARY KEY (id);


--
-- Name: workflow_history PK_b6572dd6173e4cd06fe79937b58; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_history
    ADD CONSTRAINT "PK_b6572dd6173e4cd06fe79937b58" PRIMARY KEY ("versionId");


--
-- Name: dynamic_credential_resolver PK_b76cfb088dcdaf5275e9980bb64; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dynamic_credential_resolver
    ADD CONSTRAINT "PK_b76cfb088dcdaf5275e9980bb64" PRIMARY KEY (id);


--
-- Name: agent_execution PK_ba438acc8532addc12d1ef17049; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agent_execution
    ADD CONSTRAINT "PK_ba438acc8532addc12d1ef17049" PRIMARY KEY (id);


--
-- Name: agents_memory_entries PK_bfbc45dc88f66fae4e4b4a15fec; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agents_memory_entries
    ADD CONSTRAINT "PK_bfbc45dc88f66fae4e4b4a15fec" PRIMARY KEY (id);


--
-- Name: scope PK_bfc45df0481abd7f355d6187da1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scope
    ADD CONSTRAINT "PK_bfc45df0481abd7f355d6187da1" PRIMARY KEY (slug);


--
-- Name: oauth_clients PK_c4759172d3431bae6f04e678e0d; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.oauth_clients
    ADD CONSTRAINT "PK_c4759172d3431bae6f04e678e0d" PRIMARY KEY (id);


--
-- Name: workflow_publish_history PK_c788f7caf88e91e365c97d6d04a; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_publish_history
    ADD CONSTRAINT "PK_c788f7caf88e91e365c97d6d04a" PRIMARY KEY (id);


--
-- Name: processed_data PK_ca04b9d8dc72de268fe07a65773; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.processed_data
    ADD CONSTRAINT "PK_ca04b9d8dc72de268fe07a65773" PRIMARY KEY ("workflowId", context);


--
-- Name: chat_hub_agent_tools PK_cc8806fdea48297a7d497035d72; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_hub_agent_tools
    ADD CONSTRAINT "PK_cc8806fdea48297a7d497035d72" PRIMARY KEY ("agentId", "toolId");


--
-- Name: role_mapping_rule PK_d772c8ec1a89b52d31c882bc560; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_mapping_rule
    ADD CONSTRAINT "PK_d772c8ec1a89b52d31c882bc560" PRIMARY KEY (id);


--
-- Name: token_exchange_jti PK_d8e8a6f737d530fdd2dd716e89c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.token_exchange_jti
    ADD CONSTRAINT "PK_d8e8a6f737d530fdd2dd716e89c" PRIMARY KEY (jti);


--
-- Name: settings PK_dc0fe14e6d9943f268e7b119f69ab8bd; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT "PK_dc0fe14e6d9943f268e7b119f69ab8bd" PRIMARY KEY (key);


--
-- Name: trusted_key PK_dc7d93798f3dbb6959f974c97e1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trusted_key
    ADD CONSTRAINT "PK_dc7d93798f3dbb6959f974c97e1" PRIMARY KEY ("sourceId", kid);


--
-- Name: oauth_access_tokens PK_dcd71f96a5d5f4bf79e67d322bf; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.oauth_access_tokens
    ADD CONSTRAINT "PK_dcd71f96a5d5f4bf79e67d322bf" PRIMARY KEY (token);


--
-- Name: data_table PK_e226d0001b9e6097cbfe70617cb; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.data_table
    ADD CONSTRAINT "PK_e226d0001b9e6097cbfe70617cb" PRIMARY KEY (id);


--
-- Name: instance_ai_mcp_registry_connections PK_e34e4d15d78eabbe8217e33ef03; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instance_ai_mcp_registry_connections
    ADD CONSTRAINT "PK_e34e4d15d78eabbe8217e33ef03" PRIMARY KEY (id);


--
-- Name: workflow_builder_session PK_e69ef0d385986e273423b0e8695; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_builder_session
    ADD CONSTRAINT "PK_e69ef0d385986e273423b0e8695" PRIMARY KEY (id);


--
-- Name: evaluation_collection PK_e720b6efc1e45b878ebb0b2ca30; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluation_collection
    ADD CONSTRAINT "PK_e720b6efc1e45b878ebb0b2ca30" PRIMARY KEY (id);


--
-- Name: user PK_ea8f538c94b6e352418254ed6474a81f; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "PK_ea8f538c94b6e352418254ed6474a81f" PRIMARY KEY (id);


--
-- Name: agents_observation_cursors PK_eb777ac57ab872d38f8ebd19317; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agents_observation_cursors
    ADD CONSTRAINT "PK_eb777ac57ab872d38f8ebd19317" PRIMARY KEY ("agentId", "observationScopeId");


--
-- Name: insights_raw PK_ec15125755151e3a7e00e00014f; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.insights_raw
    ADD CONSTRAINT "PK_ec15125755151e3a7e00e00014f" PRIMARY KEY (id);


--
-- Name: chat_hub_agents PK_f39a3b36bbdf0e2979ddb21cf78; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_hub_agents
    ADD CONSTRAINT "PK_f39a3b36bbdf0e2979ddb21cf78" PRIMARY KEY (id);


--
-- Name: insights_metadata PK_f448a94c35218b6208ce20cf5a1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.insights_metadata
    ADD CONSTRAINT "PK_f448a94c35218b6208ce20cf5a1" PRIMARY KEY ("metaId");


--
-- Name: agent_task_run_lock PK_f593adaf7230e964d3c25deda64; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agent_task_run_lock
    ADD CONSTRAINT "PK_f593adaf7230e964d3c25deda64" PRIMARY KEY ("agentId", "taskId");


--
-- Name: agents_resources PK_fa6b20b2d31a9991529dbf8ef7d; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agents_resources
    ADD CONSTRAINT "PK_fa6b20b2d31a9991529dbf8ef7d" PRIMARY KEY (id);


--
-- Name: oauth_authorization_codes PK_fb91ab932cfbd694061501cc20f; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.oauth_authorization_codes
    ADD CONSTRAINT "PK_fb91ab932cfbd694061501cc20f" PRIMARY KEY (code);


--
-- Name: binary_data PK_fc3691585b39408bb0551122af6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.binary_data
    ADD CONSTRAINT "PK_fc3691585b39408bb0551122af6" PRIMARY KEY ("fileId");


--
-- Name: instance_ai_observation_locks PK_fc491dd378b9448655c3c683f85; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instance_ai_observation_locks
    ADD CONSTRAINT "PK_fc491dd378b9448655c3c683f85" PRIMARY KEY ("observationScopeId", "taskKind");


--
-- Name: role_scope PK_role_scope; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_scope
    ADD CONSTRAINT "PK_role_scope" PRIMARY KEY ("roleSlug", "scopeSlug");


--
-- Name: oauth_user_consents UQ_083721d99ce8db4033e2958ebb4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.oauth_user_consents
    ADD CONSTRAINT "UQ_083721d99ce8db4033e2958ebb4" UNIQUE ("userId", "clientId");


--
-- Name: evaluation_config UQ_3c3c99a712e971835c52292e44c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluation_config
    ADD CONSTRAINT "UQ_3c3c99a712e971835c52292e44c" UNIQUE ("workflowId", name);


--
-- Name: data_table_column UQ_8082ec4890f892f0bc77473a123; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.data_table_column
    ADD CONSTRAINT "UQ_8082ec4890f892f0bc77473a123" UNIQUE ("dataTableId", name);


--
-- Name: data_table UQ_b23096ef747281ac944d28e8b0d; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.data_table
    ADD CONSTRAINT "UQ_b23096ef747281ac944d28e8b0d" UNIQUE ("projectId", name);


--
-- Name: role_mapping_rule UQ_b33ac896ad3099fc8de36fdc1c4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_mapping_rule
    ADD CONSTRAINT "UQ_b33ac896ad3099fc8de36fdc1c4" UNIQUE (type, "order");


--
-- Name: user_favorites UQ_cf6ae658ead9ffc124723413c65; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_favorites
    ADD CONSTRAINT "UQ_cf6ae658ead9ffc124723413c65" UNIQUE ("userId", "resourceId", "resourceType");


--
-- Name: user UQ_e12875dfb3b1d92d7d7c5377e2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e2" UNIQUE (email);


--
-- Name: workflow_builder_session UQ_ec2aa73632932d485a1d5192ce1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_builder_session
    ADD CONSTRAINT "UQ_ec2aa73632932d485a1d5192ce1" UNIQUE ("workflowId", "userId");


--
-- Name: auth_identity auth_identity_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_identity
    ADD CONSTRAINT auth_identity_pkey PRIMARY KEY ("providerId", "providerType");


--
-- Name: auth_provider_sync_history auth_provider_sync_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_provider_sync_history
    ADD CONSTRAINT auth_provider_sync_history_pkey PRIMARY KEY (id);


--
-- Name: credentials_entity credentials_entity_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credentials_entity
    ADD CONSTRAINT credentials_entity_pkey PRIMARY KEY (id);


--
-- Name: event_destinations event_destinations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_destinations
    ADD CONSTRAINT event_destinations_pkey PRIMARY KEY (id);


--
-- Name: execution_data execution_data_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.execution_data
    ADD CONSTRAINT execution_data_pkey PRIMARY KEY ("executionId");


--
-- Name: execution_entity pk_e3e63bbf986767844bbe1166d4e; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.execution_entity
    ADD CONSTRAINT pk_e3e63bbf986767844bbe1166d4e PRIMARY KEY (id);


--
-- Name: workflows_tags pk_workflows_tags; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflows_tags
    ADD CONSTRAINT pk_workflows_tags PRIMARY KEY ("workflowId", "tagId");


--
-- Name: tag_entity tag_entity_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tag_entity
    ADD CONSTRAINT tag_entity_pkey PRIMARY KEY (id);


--
-- Name: variables variables_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.variables
    ADD CONSTRAINT variables_pkey PRIMARY KEY (id);


--
-- Name: workflow_entity workflow_entity_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_entity
    ADD CONSTRAINT workflow_entity_pkey PRIMARY KEY (id);


--
-- Name: workflow_statistics workflow_statistics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_statistics
    ADD CONSTRAINT workflow_statistics_pkey PRIMARY KEY (id);


--
-- Name: IDX_02751202c9a2ad75f2d8e14f5e; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_02751202c9a2ad75f2d8e14f5e" ON public.instance_ai_iteration_logs USING btree ("threadId", "taskKey", "createdAt");


--
-- Name: IDX_0468a9dc35597314e641d4722a; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_0468a9dc35597314e641d4722a" ON public.agent_execution_threads USING btree ("agentId");


--
-- Name: IDX_069e791e428391a5569e7a96b2; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_069e791e428391a5569e7a96b2" ON public.agents_memory_entry_cursors USING btree ("observationScopeId");


--
-- Name: IDX_070b5de842ece9ccdda0d9738b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_070b5de842ece9ccdda0d9738b" ON public.workflow_publish_history USING btree ("workflowId", "versionId");


--
-- Name: IDX_07cb1e4a302629c5fa5d74d2bb; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_07cb1e4a302629c5fa5d74d2bb" ON public.agents_observations USING btree ("agentId", "observationScopeId", status);


--
-- Name: IDX_0babdf6e3b897a86fe4678355e; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_0babdf6e3b897a86fe4678355e" ON public.instance_ai_pending_confirmations USING btree ("checkpointKey");


--
-- Name: IDX_0d5db648188d338df7fb2a8064; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_0d5db648188d338df7fb2a8064" ON public.instance_ai_observations USING btree ("observationScopeId", status, "createdAt", id);


--
-- Name: IDX_0e2f8bf92a7a9c88b89670f701; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_0e2f8bf92a7a9c88b89670f701" ON public.agent_execution_threads USING btree ("projectId");


--
-- Name: IDX_0edf1226b77ddc525eae493807; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_0edf1226b77ddc525eae493807" ON public.agents_memory_entries USING btree ("supersededBy");


--
-- Name: IDX_127ee1078ffa952bb37b511efa; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_127ee1078ffa952bb37b511efa" ON public.agents_observations USING btree ("supersededBy");


--
-- Name: IDX_1443a75e59adbfb796071d6639; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_1443a75e59adbfb796071d6639" ON public.agents_memory_entries USING btree ("resourceId");


--
-- Name: IDX_14f68deffaf858465715995508; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_14f68deffaf858465715995508" ON public.folder USING btree ("projectId", id);


--
-- Name: IDX_16db3adb7b19df1ee55ff06b27; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_16db3adb7b19df1ee55ff06b27" ON public.instance_ai_mcp_registry_connections USING btree ("userId", "serverSlug", "credentialId");


--
-- Name: IDX_1d11050a381548c42c32cc25c4; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_1d11050a381548c42c32cc25c4" ON public.user_favorites USING btree ("resourceType", "resourceId");


--
-- Name: IDX_1d8ab99d5861c9388d2dc1cf73; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_1d8ab99d5861c9388d2dc1cf73" ON public.insights_metadata USING btree ("workflowId");


--
-- Name: IDX_1dd5c393ad0517be3c31a7af83; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_1dd5c393ad0517be3c31a7af83" ON public.user_favorites USING btree ("userId");


--
-- Name: IDX_1e31657f5fe46816c34be7c1b4; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_1e31657f5fe46816c34be7c1b4" ON public.workflow_history USING btree ("workflowId");


--
-- Name: IDX_1eeb64cb9d66a927988de759e6; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_1eeb64cb9d66a927988de759e6" ON public.instance_ai_messages USING btree ("threadId");


--
-- Name: IDX_1ef35bac35d20bdae979d917a3; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_1ef35bac35d20bdae979d917a3" ON public.user_api_keys USING btree ("apiKey");


--
-- Name: IDX_2b23f3f24a70bebb990203b011; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_2b23f3f24a70bebb990203b011" ON public.instance_ai_checkpoints USING btree ("threadId");


--
-- Name: IDX_35a78869286c65d9330d02b88f; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_35a78869286c65d9330d02b88f" ON public.role_mapping_rule_project USING btree ("projectId");


--
-- Name: IDX_39b07732e819fb561d74c38763; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_39b07732e819fb561d74c38763" ON public.ai_builder_temporary_workflow USING btree ("threadId");


--
-- Name: IDX_401b94abf83d1ac7a841f31330; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_401b94abf83d1ac7a841f31330" ON public.instance_ai_thread_grants USING btree ("userId");


--
-- Name: IDX_451d387a182fa8dd8002dfc3a7; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_451d387a182fa8dd8002dfc3a7" ON public.agents_memory_entry_sources USING btree ("threadId");


--
-- Name: IDX_45dafc48fe2ce95eac30fc8ffd; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_45dafc48fe2ce95eac30fc8ffd" ON public.agent_files USING btree ("agentId", "createdAt");


--
-- Name: IDX_4c72ebdb265d1775bf61147af0; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_4c72ebdb265d1775bf61147af0" ON public.chat_hub_tools USING btree ("ownerId", name);


--
-- Name: IDX_4cfd8a70ebb0a5b0cf047dca3c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_4cfd8a70ebb0a5b0cf047dca3c" ON public.agents_observations USING btree ("observationScopeId");


--
-- Name: IDX_501e2d1701a10e24fb69ab5fc5; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_501e2d1701a10e24fb69ab5fc5" ON public.agents_observations USING btree ("parentId");


--
-- Name: IDX_54fa1b94f34a409beafae567a4; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_54fa1b94f34a409beafae567a4" ON public.agents_threads USING btree ("resourceId");


--
-- Name: IDX_56900edc3cfd16612e2ef2c6a8; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_56900edc3cfd16612e2ef2c6a8" ON public.binary_data USING btree ("sourceType", "sourceId");


--
-- Name: IDX_5e31c210f896d539964bf99fe3; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_5e31c210f896d539964bf99fe3" ON public.agent_checkpoints USING btree ("agentId");


--
-- Name: IDX_5ec8e8c8d3539f3696cf73b43b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_5ec8e8c8d3539f3696cf73b43b" ON public.credential_dependency USING btree ("credentialId");


--
-- Name: IDX_5f0643f6717905a05164090dde; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_5f0643f6717905a05164090dde" ON public.project_relation USING btree ("userId");


--
-- Name: IDX_60b6a84299eeb3f671dfec7693; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_60b6a84299eeb3f671dfec7693" ON public.insights_by_period USING btree ("periodStart", type, "periodUnit", "metaId");


--
-- Name: IDX_61448d56d61802b5dfde5cdb00; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_61448d56d61802b5dfde5cdb00" ON public.project_relation USING btree ("projectId");


--
-- Name: IDX_62476b94b56d9dc7ed9ed75d3d; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_62476b94b56d9dc7ed9ed75d3d" ON public.dynamic_credential_entry USING btree (subject_id);


--
-- Name: IDX_63d3c3a68b9cebf05f967f0b1c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_63d3c3a68b9cebf05f967f0b1c" ON public.agent_execution USING btree ("threadId", "createdAt");


--
-- Name: IDX_63d7bbae72c767cf162d459fcc; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_63d7bbae72c767cf162d459fcc" ON public.user_api_keys USING btree ("userId", label);


--
-- Name: IDX_6b55089892e447c2f82e5ec60e; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_6b55089892e447c2f82e5ec60e" ON public.agents_observation_locks USING btree ("observationScopeId");


--
-- Name: IDX_6edec973a6450990977bb854c3; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_6edec973a6450990977bb854c3" ON public.dynamic_credential_user_entry USING btree ("resolverId");


--
-- Name: IDX_768189b506cc26c4fe878b87cb; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_768189b506cc26c4fe878b87cb" ON public.instance_ai_checkpoints USING btree ("runId");


--
-- Name: IDX_76e212c6867fbaa06bf0decd6f; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_76e212c6867fbaa06bf0decd6f" ON public.instance_ai_messages USING btree ("resourceId");


--
-- Name: IDX_87aa187d27ea67eafd16490515; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_87aa187d27ea67eafd16490515" ON public.agents_observation_cursors USING btree ("observationScopeId");


--
-- Name: IDX_87cd5a8da20304b089ea2f83fe; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_87cd5a8da20304b089ea2f83fe" ON public.agent_history USING btree ("agentId");


--
-- Name: IDX_8e4b4774db42f1e6dda3452b2a; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_8e4b4774db42f1e6dda3452b2a" ON public.test_case_execution USING btree ("testRunId");


--
-- Name: IDX_91ee85fa9619dd6776725e117b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_91ee85fa9619dd6776725e117b" ON public.credential_dependency USING btree ("dependencyType", "dependencyId");


--
-- Name: IDX_92f13cb6bc694227e069447f7b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_92f13cb6bc694227e069447f7b" ON public.instance_ai_observational_memory USING btree ("lookupKey");


--
-- Name: IDX_9594c0983cfee1c8ff49b05848; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_9594c0983cfee1c8ff49b05848" ON public.agents_memory_entry_locks USING btree ("resourceId");


--
-- Name: IDX_97f863fa83c4786f1956508496; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_97f863fa83c4786f1956508496" ON public.execution_annotations USING btree ("executionId");


--
-- Name: IDX_9c9ee9df586e60bb723234e499; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_9c9ee9df586e60bb723234e499" ON public.dynamic_credential_resolver USING btree (type);


--
-- Name: IDX_UniqueRoleDisplayName; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_UniqueRoleDisplayName" ON public.role USING btree ("displayName");


--
-- Name: IDX_a03e04e94bea8439dd166d4b52; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_a03e04e94bea8439dd166d4b52" ON public.agents_memory_entries USING btree ("agentId", "resourceId", "contentHash");


--
-- Name: IDX_a30d560207c4071d98aa03c179; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_a30d560207c4071d98aa03c179" ON public.agents USING btree ("projectId");


--
-- Name: IDX_a353ac251315ef0af6ad3c9f0a; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_a353ac251315ef0af6ad3c9f0a" ON public.agents_memory_entry_sources USING btree ("memoryEntryId", "observationId", "evidenceHash");


--
-- Name: IDX_a3697779b366e131b2bbdae297; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_a3697779b366e131b2bbdae297" ON public.execution_annotation_tags USING btree ("tagId");


--
-- Name: IDX_a36dc616fabc3f736bb82410a2; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_a36dc616fabc3f736bb82410a2" ON public.dynamic_credential_user_entry USING btree ("userId");


--
-- Name: IDX_a371ee6b8e0ebb5635f8baa46d; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_a371ee6b8e0ebb5635f8baa46d" ON public.instance_ai_workflow_snapshots USING btree ("workflowName", status);


--
-- Name: IDX_a48ce930c3bc7604894b8f0eaa; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_a48ce930c3bc7604894b8f0eaa" ON public.evaluation_collection USING btree ("workflowId");


--
-- Name: IDX_a4ff2d9b9628ea988fa9e7d0bf; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_a4ff2d9b9628ea988fa9e7d0bf" ON public.workflow_dependency USING btree ("workflowId");


--
-- Name: IDX_a680ac96aae02dc887bbaac512; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_a680ac96aae02dc887bbaac512" ON public.instance_ai_observational_memory USING btree (scope, "threadId", "resourceId");


--
-- Name: IDX_a80e0ee839a2f10ba4b86e1999; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_a80e0ee839a2f10ba4b86e1999" ON public.instance_ai_observations USING btree ("supersededBy");


--
-- Name: IDX_ae51b54c4bb430cf92f48b623f; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_ae51b54c4bb430cf92f48b623f" ON public.annotation_tag_entity USING btree (name);


--
-- Name: IDX_aff2807b31eccbafe59d0474f0; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_aff2807b31eccbafe59d0474f0" ON public.agents_memory_entries USING btree ("agentId", "resourceId", status, "createdAt", id);


--
-- Name: IDX_agent_execution_threads_taskVersionId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_agent_execution_threads_taskVersionId" ON public.agent_execution_threads USING btree ("taskVersionId");


--
-- Name: IDX_agent_files_agentId_binaryDataId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_agent_files_agentId_binaryDataId" ON public.agent_files USING btree ("agentId", "binaryDataId");


--
-- Name: IDX_agent_files_agentId_fileName; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_agent_files_agentId_fileName" ON public.agent_files USING btree ("agentId", "fileName");


--
-- Name: IDX_agents_messages_threadId_createdAt; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_agents_messages_threadId_createdAt" ON public.agents_messages USING btree ("threadId", "createdAt");


--
-- Name: IDX_agents_projectId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_agents_projectId" ON public.agents USING btree ("projectId");


--
-- Name: IDX_ba67ee8dc311830a2eea89b6e9; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_ba67ee8dc311830a2eea89b6e9" ON public.instance_ai_pending_confirmations USING btree ("threadId");


--
-- Name: IDX_bb66e404c35996b0d694617750; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_bb66e404c35996b0d694617750" ON public.role_mapping_rule USING btree (role);


--
-- Name: IDX_be9d0eca0b19fb93d4eb74b327; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_be9d0eca0b19fb93d4eb74b327" ON public.instance_ai_checkpoints USING btree ("resourceId");


--
-- Name: IDX_c1519757391996eb06064f0e7c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_c1519757391996eb06064f0e7c" ON public.execution_annotation_tags USING btree ("annotationId");


--
-- Name: IDX_cb7c15d22fd068a0806aa57fc0; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cb7c15d22fd068a0806aa57fc0" ON public.agents_memory_entry_sources USING btree ("observationId");


--
-- Name: IDX_cec8eea3bf49551482ccb4933e; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_cec8eea3bf49551482ccb4933e" ON public.execution_metadata USING btree ("executionId", key);


--
-- Name: IDX_chat_hub_messages_sessionId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_chat_hub_messages_sessionId" ON public.chat_hub_messages USING btree ("sessionId");


--
-- Name: IDX_chat_hub_sessions_owner_lastmsg_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_chat_hub_sessions_owner_lastmsg_id" ON public.chat_hub_sessions USING btree ("ownerId", "lastMessageAt" DESC, id);


--
-- Name: IDX_credential_dependency_credentialId_dependencyType_dependenc; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_credential_dependency_credentialId_dependencyType_dependenc" ON public.credential_dependency USING btree ("credentialId", "dependencyType", "dependencyId");


--
-- Name: IDX_d3a2bc880e7a8626802e5474ad; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_d3a2bc880e7a8626802e5474ad" ON public.instance_ai_run_snapshots USING btree ("threadId", "createdAt");


--
-- Name: IDX_d61a12235d268a49af6a3c09c1; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_d61a12235d268a49af6a3c09c1" ON public.dynamic_credential_entry USING btree (resolver_id);


--
-- Name: IDX_d634a0c93fd7de68a87eab951b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_d634a0c93fd7de68a87eab951b" ON public.evaluation_collection USING btree ("evaluationConfigId");


--
-- Name: IDX_d6870d3b6e4c185d33926f423c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_d6870d3b6e4c185d33926f423c" ON public.test_run USING btree ("workflowId");


--
-- Name: IDX_d7a4aba7440449865e2b924377; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_d7a4aba7440449865e2b924377" ON public.instance_ai_pending_confirmations USING btree ("expiresAt");


--
-- Name: IDX_d926c16c2ad9728cb9a81790c0; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_d926c16c2ad9728cb9a81790c0" ON public.instance_ai_run_snapshots USING btree ("threadId", "messageGroupId");


--
-- Name: IDX_daef2195a4a846eb70eed15e03; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_daef2195a4a846eb70eed15e03" ON public.instance_ai_observations USING btree ("parentId");


--
-- Name: IDX_deployment_key_data_encryption_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_deployment_key_data_encryption_active" ON public.deployment_key USING btree (type) WHERE (((status)::text = 'active'::text) AND ((type)::text = 'data_encryption'::text));


--
-- Name: IDX_deployment_key_instance_id_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_deployment_key_instance_id_active" ON public.deployment_key USING btree (type) WHERE (((status)::text = 'active'::text) AND ((type)::text = 'instance.id'::text));


--
-- Name: IDX_deployment_key_jwe_private_key_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_deployment_key_jwe_private_key_active" ON public.deployment_key USING btree (type, algorithm) WHERE (((status)::text = 'active'::text) AND ((type)::text = 'jwe.private-key'::text));


--
-- Name: IDX_deployment_key_signing_binary_data_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_deployment_key_signing_binary_data_active" ON public.deployment_key USING btree (type) WHERE (((status)::text = 'active'::text) AND ((type)::text = 'signing.binary_data'::text));


--
-- Name: IDX_deployment_key_signing_hmac_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_deployment_key_signing_hmac_active" ON public.deployment_key USING btree (type) WHERE (((status)::text = 'active'::text) AND ((type)::text = 'signing.hmac'::text));


--
-- Name: IDX_deployment_key_signing_jwt_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_deployment_key_signing_jwt_active" ON public.deployment_key USING btree (type) WHERE (((status)::text = 'active'::text) AND ((type)::text = 'signing.jwt'::text));


--
-- Name: IDX_df5fd25c8bbfd2b042602600d8; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_df5fd25c8bbfd2b042602600d8" ON public.instance_ai_pending_confirmations USING btree ("userId");


--
-- Name: IDX_e48a201071ab85d9d09119d640; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_e48a201071ab85d9d09119d640" ON public.workflow_dependency USING btree ("dependencyKey");


--
-- Name: IDX_e7fe1cfda990c14a445937d0b9; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_e7fe1cfda990c14a445937d0b9" ON public.workflow_dependency USING btree ("dependencyType");


--
-- Name: IDX_execution_entity_deduplicationKey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_execution_entity_deduplicationKey" ON public.execution_entity USING btree ("deduplicationKey") WHERE ("deduplicationKey" IS NOT NULL);


--
-- Name: IDX_execution_entity_deletedAt; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_execution_entity_deletedAt" ON public.execution_entity USING btree ("deletedAt");


--
-- Name: IDX_execution_entity_workflowId_status_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_execution_entity_workflowId_status_id" ON public.execution_entity USING btree ("workflowId", status, id) WHERE ("deletedAt" IS NULL);


--
-- Name: IDX_f36dea4d38fe92e0e8f44d5a56; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_f36dea4d38fe92e0e8f44d5a56" ON public.instance_ai_threads USING btree ("resourceId");


--
-- Name: IDX_f45d0535a2ed59b6c2dd6da98a; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_f45d0535a2ed59b6c2dd6da98a" ON public.agent_task_definition USING btree ("agentId");


--
-- Name: IDX_f9573af4ed653f13b0ba1f7b12; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_f9573af4ed653f13b0ba1f7b12" ON public.agents_memory_entry_sources USING btree ("agentId", "threadId");


--
-- Name: IDX_fc7bf858660bfafd19181e8e35; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_fc7bf858660bfafd19181e8e35" ON public.agents_messages USING btree ("threadId", "createdAt");


--
-- Name: IDX_fd7542bb123074760285dc1bbf; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_fd7542bb123074760285dc1bbf" ON public.evaluation_config USING btree ("workflowId");


--
-- Name: IDX_insights_raw_timestamp_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_insights_raw_timestamp_id" ON public.insights_raw USING btree ("timestamp", id);


--
-- Name: IDX_instance_ai_threads_projectId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_instance_ai_threads_projectId" ON public.instance_ai_threads USING btree ("projectId");


--
-- Name: IDX_role_scope_scopeSlug; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_role_scope_scopeSlug" ON public.role_scope USING btree ("scopeSlug");


--
-- Name: IDX_secrets_provider_connection_providerKey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_secrets_provider_connection_providerKey" ON public.secrets_provider_connection USING btree ("providerKey");


--
-- Name: IDX_shared_workflow_projectId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_shared_workflow_projectId" ON public.shared_workflow USING btree ("projectId");


--
-- Name: IDX_test_run_collectionId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_test_run_collectionId" ON public.test_run USING btree ("collectionId");


--
-- Name: IDX_test_run_evaluationConfigId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_test_run_evaluationConfigId" ON public.test_run USING btree ("evaluationConfigId");


--
-- Name: IDX_workflow_dependency_publishedVersionId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_workflow_dependency_publishedVersionId" ON public.workflow_dependency USING btree ("publishedVersionId");


--
-- Name: IDX_workflow_entity_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_workflow_entity_name" ON public.workflow_entity USING btree (name);


--
-- Name: IDX_workflow_entity_sourceWorkflowId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_workflow_entity_sourceWorkflowId" ON public.workflow_entity USING btree ("sourceWorkflowId") WHERE ("sourceWorkflowId" IS NOT NULL);


--
-- Name: IDX_workflow_publication_outbox_active_workflow_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_workflow_publication_outbox_active_workflow_status" ON public.workflow_publication_outbox USING btree ("workflowId", status) WHERE ((status)::text = ANY ((ARRAY['pending'::character varying, 'in_progress'::character varying])::text[]));


--
-- Name: IDX_workflow_statistics_workflow_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_workflow_statistics_workflow_name" ON public.workflow_statistics USING btree ("workflowId", name);


--
-- Name: idx_07fde106c0b471d8cc80a64fc8; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_07fde106c0b471d8cc80a64fc8 ON public.credentials_entity USING btree (type);


--
-- Name: idx_16f4436789e804e3e1c9eeb240; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_16f4436789e804e3e1c9eeb240 ON public.webhook_entity USING btree ("webhookId", method, "pathLength");


--
-- Name: idx_812eb05f7451ca757fb98444ce; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_812eb05f7451ca757fb98444ce ON public.tag_entity USING btree (name);


--
-- Name: idx_execution_entity_stopped_at_status_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_execution_entity_stopped_at_status_deleted_at ON public.execution_entity USING btree ("stoppedAt", status, "deletedAt") WHERE (("stoppedAt" IS NOT NULL) AND ("deletedAt" IS NULL));


--
-- Name: idx_execution_entity_wait_till_status_deleted_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_execution_entity_wait_till_status_deleted_at ON public.execution_entity USING btree ("waitTill", status, "deletedAt") WHERE (("waitTill" IS NOT NULL) AND ("deletedAt" IS NULL));


--
-- Name: idx_execution_entity_workflow_id_started_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_execution_entity_workflow_id_started_at ON public.execution_entity USING btree ("workflowId", "startedAt") WHERE (("startedAt" IS NOT NULL) AND ("deletedAt" IS NULL));


--
-- Name: idx_workflows_tags_workflow_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_workflows_tags_workflow_id ON public.workflows_tags USING btree ("workflowId");


--
-- Name: pk_credentials_entity_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX pk_credentials_entity_id ON public.credentials_entity USING btree (id);


--
-- Name: pk_tag_entity_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX pk_tag_entity_id ON public.tag_entity USING btree (id);


--
-- Name: pk_workflow_entity_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX pk_workflow_entity_id ON public.workflow_entity USING btree (id);


--
-- Name: project_relation_role_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX project_relation_role_idx ON public.project_relation USING btree (role);


--
-- Name: project_relation_role_project_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX project_relation_role_project_idx ON public.project_relation USING btree ("projectId", role);


--
-- Name: user_role_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_role_idx ON public."user" USING btree ("roleSlug");


--
-- Name: variables_global_key_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX variables_global_key_unique ON public.variables USING btree (key) WHERE ("projectId" IS NULL);


--
-- Name: variables_project_key_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX variables_project_key_unique ON public.variables USING btree ("projectId", key) WHERE ("projectId" IS NOT NULL);


--
-- Name: workflow_entity workflow_version_increment; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER workflow_version_increment BEFORE UPDATE ON public.workflow_entity FOR EACH ROW EXECUTE FUNCTION public.increment_workflow_version();


--
-- Name: workflow_builder_session FK_00290cdeee4d4d7db84709be936; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_builder_session
    ADD CONSTRAINT "FK_00290cdeee4d4d7db84709be936" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: agent_execution_threads FK_0468a9dc35597314e641d4722aa; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agent_execution_threads
    ADD CONSTRAINT "FK_0468a9dc35597314e641d4722aa" FOREIGN KEY ("agentId") REFERENCES public.agents(id) ON DELETE CASCADE;


--
-- Name: agents_memory_entry_cursors FK_069e791e428391a5569e7a96b20; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agents_memory_entry_cursors
    ADD CONSTRAINT "FK_069e791e428391a5569e7a96b20" FOREIGN KEY ("observationScopeId") REFERENCES public.agents_threads(id) ON DELETE CASCADE;


--
-- Name: processed_data FK_06a69a7032c97a763c2c7599464; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.processed_data
    ADD CONSTRAINT "FK_06a69a7032c97a763c2c7599464" FOREIGN KEY ("workflowId") REFERENCES public.workflow_entity(id) ON DELETE CASCADE;


--
-- Name: workflow_entity FK_08d6c67b7f722b0039d9d5ed620; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_entity
    ADD CONSTRAINT "FK_08d6c67b7f722b0039d9d5ed620" FOREIGN KEY ("activeVersionId") REFERENCES public.workflow_history("versionId") ON DELETE RESTRICT;


--
-- Name: agents_observation_locks FK_093e44ae20f2518e97d83a95433; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agents_observation_locks
    ADD CONSTRAINT "FK_093e44ae20f2518e97d83a95433" FOREIGN KEY ("agentId") REFERENCES public.agents(id) ON DELETE CASCADE;


--
-- Name: agents_messages FK_0a8057a61afabd2999608ffd0d9; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agents_messages
    ADD CONSTRAINT "FK_0a8057a61afabd2999608ffd0d9" FOREIGN KEY ("threadId") REFERENCES public.agents_threads(id) ON DELETE CASCADE;


--
-- Name: instance_ai_pending_confirmations FK_0babdf6e3b897a86fe4678355eb; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instance_ai_pending_confirmations
    ADD CONSTRAINT "FK_0babdf6e3b897a86fe4678355eb" FOREIGN KEY ("checkpointKey") REFERENCES public.instance_ai_checkpoints(key) ON DELETE CASCADE;


--
-- Name: agents_memory_entry_locks FK_0ccf6d9ea6f44fa1c264fc2f795; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agents_memory_entry_locks
    ADD CONSTRAINT "FK_0ccf6d9ea6f44fa1c264fc2f795" FOREIGN KEY ("agentId") REFERENCES public.agents(id) ON DELETE CASCADE;


--
-- Name: agent_execution_threads FK_0e2f8bf92a7a9c88b89670f701c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agent_execution_threads
    ADD CONSTRAINT "FK_0e2f8bf92a7a9c88b89670f701c" FOREIGN KEY ("projectId") REFERENCES public.project(id) ON DELETE CASCADE;


--
-- Name: agents_memory_entries FK_0edf1226b77ddc525eae4938079; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agents_memory_entries
    ADD CONSTRAINT "FK_0edf1226b77ddc525eae4938079" FOREIGN KEY ("supersededBy") REFERENCES public.agents_memory_entries(id);


--
-- Name: instance_ai_observation_locks FK_103e2e5f454860b28ea05a82c74; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instance_ai_observation_locks
    ADD CONSTRAINT "FK_103e2e5f454860b28ea05a82c74" FOREIGN KEY ("observationScopeId") REFERENCES public.instance_ai_threads(id) ON DELETE CASCADE;


--
-- Name: agents_observations FK_127ee1078ffa952bb37b511efad; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agents_observations
    ADD CONSTRAINT "FK_127ee1078ffa952bb37b511efad" FOREIGN KEY ("supersededBy") REFERENCES public.agents_observations(id);


--
-- Name: agents_memory_entries FK_1443a75e59adbfb796071d66393; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agents_memory_entries
    ADD CONSTRAINT "FK_1443a75e59adbfb796071d66393" FOREIGN KEY ("resourceId") REFERENCES public.agents_resources(id) ON DELETE CASCADE;


--
-- Name: project_secrets_provider_access FK_18e5c27d2524b1638b292904e48; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_secrets_provider_access
    ADD CONSTRAINT "FK_18e5c27d2524b1638b292904e48" FOREIGN KEY ("secretsProviderConnectionId") REFERENCES public.secrets_provider_connection(id) ON DELETE CASCADE;


--
-- Name: agent_task_snapshot FK_1acedce6690392ef1611cca8b88; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agent_task_snapshot
    ADD CONSTRAINT "FK_1acedce6690392ef1611cca8b88" FOREIGN KEY ("versionId") REFERENCES public.agent_history("versionId") ON DELETE CASCADE;


--
-- Name: instance_ai_mcp_registry_connections FK_1d25707354d2012da256eb2ec0a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instance_ai_mcp_registry_connections
    ADD CONSTRAINT "FK_1d25707354d2012da256eb2ec0a" FOREIGN KEY ("serverSlug") REFERENCES public.mcp_registry_server(slug) ON DELETE CASCADE;


--
-- Name: insights_metadata FK_1d8ab99d5861c9388d2dc1cf733; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.insights_metadata
    ADD CONSTRAINT "FK_1d8ab99d5861c9388d2dc1cf733" FOREIGN KEY ("workflowId") REFERENCES public.workflow_entity(id) ON DELETE SET NULL;


--
-- Name: user_favorites FK_1dd5c393ad0517be3c31a7af836; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_favorites
    ADD CONSTRAINT "FK_1dd5c393ad0517be3c31a7af836" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: workflow_history FK_1e31657f5fe46816c34be7c1b4b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_history
    ADD CONSTRAINT "FK_1e31657f5fe46816c34be7c1b4b" FOREIGN KEY ("workflowId") REFERENCES public.workflow_entity(id) ON DELETE CASCADE;


--
-- Name: instance_ai_mcp_registry_connections FK_1e826120e7e53ebc4681f026de8; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instance_ai_mcp_registry_connections
    ADD CONSTRAINT "FK_1e826120e7e53ebc4681f026de8" FOREIGN KEY ("credentialId") REFERENCES public.credentials_entity(id) ON DELETE CASCADE;


--
-- Name: instance_ai_messages FK_1eeb64cb9d66a927988de759e6e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instance_ai_messages
    ADD CONSTRAINT "FK_1eeb64cb9d66a927988de759e6e" FOREIGN KEY ("threadId") REFERENCES public.instance_ai_threads(id) ON DELETE CASCADE;


--
-- Name: chat_hub_messages FK_1f4998c8a7dec9e00a9ab15550e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_hub_messages
    ADD CONSTRAINT "FK_1f4998c8a7dec9e00a9ab15550e" FOREIGN KEY ("revisionOfMessageId") REFERENCES public.chat_hub_messages(id) ON DELETE CASCADE;


--
-- Name: oauth_user_consents FK_21e6c3c2d78a097478fae6aaefa; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.oauth_user_consents
    ADD CONSTRAINT "FK_21e6c3c2d78a097478fae6aaefa" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: insights_metadata FK_2375a1eda085adb16b24615b69c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.insights_metadata
    ADD CONSTRAINT "FK_2375a1eda085adb16b24615b69c" FOREIGN KEY ("projectId") REFERENCES public.project(id) ON DELETE SET NULL;


--
-- Name: chat_hub_messages FK_25c9736e7f769f3a005eef4b372; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_hub_messages
    ADD CONSTRAINT "FK_25c9736e7f769f3a005eef4b372" FOREIGN KEY ("retryOfMessageId") REFERENCES public.chat_hub_messages(id) ON DELETE CASCADE;


--
-- Name: agents_memory_entries FK_28e981fb675e9b44ce02f0ec1dd; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agents_memory_entries
    ADD CONSTRAINT "FK_28e981fb675e9b44ce02f0ec1dd" FOREIGN KEY ("agentId") REFERENCES public.agents(id) ON DELETE CASCADE;


--
-- Name: instance_ai_checkpoints FK_2b23f3f24a70bebb990203b011e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instance_ai_checkpoints
    ADD CONSTRAINT "FK_2b23f3f24a70bebb990203b011e" FOREIGN KEY ("threadId") REFERENCES public.instance_ai_threads(id) ON DELETE CASCADE;


--
-- Name: chat_hub_agent_tools FK_2b53d796b3dbae91b1a9553c048; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_hub_agent_tools
    ADD CONSTRAINT "FK_2b53d796b3dbae91b1a9553c048" FOREIGN KEY ("agentId") REFERENCES public.chat_hub_agents(id) ON DELETE CASCADE;


--
-- Name: instance_ai_run_snapshots FK_2f63fa21d09d7918f347ddbdf70; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instance_ai_run_snapshots
    ADD CONSTRAINT "FK_2f63fa21d09d7918f347ddbdf70" FOREIGN KEY ("threadId") REFERENCES public.instance_ai_threads(id) ON DELETE CASCADE;


--
-- Name: execution_metadata FK_31d0b4c93fb85ced26f6005cda3; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.execution_metadata
    ADD CONSTRAINT "FK_31d0b4c93fb85ced26f6005cda3" FOREIGN KEY ("executionId") REFERENCES public.execution_entity(id) ON DELETE CASCADE;


--
-- Name: instance_ai_observational_memory FK_34018c303885cd37093458e6409; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instance_ai_observational_memory
    ADD CONSTRAINT "FK_34018c303885cd37093458e6409" FOREIGN KEY ("threadId") REFERENCES public.instance_ai_threads(id) ON DELETE SET NULL;


--
-- Name: role_mapping_rule_project FK_35a78869286c65d9330d02b88f5; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_mapping_rule_project
    ADD CONSTRAINT "FK_35a78869286c65d9330d02b88f5" FOREIGN KEY ("projectId") REFERENCES public.project(id) ON DELETE CASCADE;


--
-- Name: ai_builder_temporary_workflow FK_39b07732e819fb561d74c38763f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_builder_temporary_workflow
    ADD CONSTRAINT "FK_39b07732e819fb561d74c38763f" FOREIGN KEY ("threadId") REFERENCES public.instance_ai_threads(id) ON DELETE CASCADE;


--
-- Name: instance_ai_thread_grants FK_401b94abf83d1ac7a841f31330e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instance_ai_thread_grants
    ADD CONSTRAINT "FK_401b94abf83d1ac7a841f31330e" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: shared_credentials FK_416f66fc846c7c442970c094ccf; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shared_credentials
    ADD CONSTRAINT "FK_416f66fc846c7c442970c094ccf" FOREIGN KEY ("credentialsId") REFERENCES public.credentials_entity(id) ON DELETE CASCADE;


--
-- Name: variables FK_42f6c766f9f9d2edcc15bdd6e9b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.variables
    ADD CONSTRAINT "FK_42f6c766f9f9d2edcc15bdd6e9b" FOREIGN KEY ("projectId") REFERENCES public.project(id) ON DELETE CASCADE;


--
-- Name: chat_hub_agent_tools FK_43e70f04c53344f82483d0570f6; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_hub_agent_tools
    ADD CONSTRAINT "FK_43e70f04c53344f82483d0570f6" FOREIGN KEY ("toolId") REFERENCES public.chat_hub_tools(id) ON DELETE CASCADE;


--
-- Name: chat_hub_agents FK_441ba2caba11e077ce3fbfa2cd8; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_hub_agents
    ADD CONSTRAINT "FK_441ba2caba11e077ce3fbfa2cd8" FOREIGN KEY ("ownerId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: agents_memory_entry_sources FK_451d387a182fa8dd8002dfc3a77; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agents_memory_entry_sources
    ADD CONSTRAINT "FK_451d387a182fa8dd8002dfc3a77" FOREIGN KEY ("threadId") REFERENCES public.agents_threads(id) ON DELETE CASCADE;


--
-- Name: agents_memory_entry_sources FK_4706f6223313959b7437a2b48df; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agents_memory_entry_sources
    ADD CONSTRAINT "FK_4706f6223313959b7437a2b48df" FOREIGN KEY ("memoryEntryId") REFERENCES public.agents_memory_entries(id) ON DELETE CASCADE;


--
-- Name: agents_observations FK_4cfd8a70ebb0a5b0cf047dca3cf; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agents_observations
    ADD CONSTRAINT "FK_4cfd8a70ebb0a5b0cf047dca3cf" FOREIGN KEY ("observationScopeId") REFERENCES public.agents_threads(id) ON DELETE CASCADE;


--
-- Name: agents_observations FK_501e2d1701a10e24fb69ab5fc5f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agents_observations
    ADD CONSTRAINT "FK_501e2d1701a10e24fb69ab5fc5f" FOREIGN KEY ("parentId") REFERENCES public.agents_observations(id);


--
-- Name: instance_ai_observation_cursors FK_5b6319b2e9a37c1064a72428f9a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instance_ai_observation_cursors
    ADD CONSTRAINT "FK_5b6319b2e9a37c1064a72428f9a" FOREIGN KEY ("observationScopeId") REFERENCES public.instance_ai_threads(id) ON DELETE CASCADE;


--
-- Name: workflow_published_version FK_5c76fb7ee939fe2530374d3f75a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_published_version
    ADD CONSTRAINT "FK_5c76fb7ee939fe2530374d3f75a" FOREIGN KEY ("workflowId") REFERENCES public.workflow_entity(id) ON DELETE RESTRICT;


--
-- Name: agent_checkpoints FK_5e31c210f896d539964bf99fe32; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agent_checkpoints
    ADD CONSTRAINT "FK_5e31c210f896d539964bf99fe32" FOREIGN KEY ("agentId") REFERENCES public.agents(id) ON DELETE CASCADE;


--
-- Name: credential_dependency FK_5ec8e8c8d3539f3696cf73b43bf; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credential_dependency
    ADD CONSTRAINT "FK_5ec8e8c8d3539f3696cf73b43bf" FOREIGN KEY ("credentialId") REFERENCES public.credentials_entity(id) ON DELETE CASCADE;


--
-- Name: project_relation FK_5f0643f6717905a05164090dde7; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_relation
    ADD CONSTRAINT "FK_5f0643f6717905a05164090dde7" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: project_relation FK_61448d56d61802b5dfde5cdb002; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_relation
    ADD CONSTRAINT "FK_61448d56d61802b5dfde5cdb002" FOREIGN KEY ("projectId") REFERENCES public.project(id) ON DELETE CASCADE;


--
-- Name: insights_by_period FK_6414cfed98daabbfdd61a1cfbc0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.insights_by_period
    ADD CONSTRAINT "FK_6414cfed98daabbfdd61a1cfbc0" FOREIGN KEY ("metaId") REFERENCES public.insights_metadata("metaId") ON DELETE CASCADE;


--
-- Name: oauth_authorization_codes FK_64d965bd072ea24fb6da55468cd; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.oauth_authorization_codes
    ADD CONSTRAINT "FK_64d965bd072ea24fb6da55468cd" FOREIGN KEY ("clientId") REFERENCES public.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: agents_observation_cursors FK_64e92819f4b413661ed6e2c3c3d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agents_observation_cursors
    ADD CONSTRAINT "FK_64e92819f4b413661ed6e2c3c3d" FOREIGN KEY ("agentId") REFERENCES public.agents(id) ON DELETE CASCADE;


--
-- Name: chat_hub_session_tools FK_6596a328affd8d4967ffb303eee; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_hub_session_tools
    ADD CONSTRAINT "FK_6596a328affd8d4967ffb303eee" FOREIGN KEY ("toolId") REFERENCES public.chat_hub_tools(id) ON DELETE CASCADE;


--
-- Name: chat_hub_messages FK_6afb260449dd7a9b85355d4e0c9; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_hub_messages
    ADD CONSTRAINT "FK_6afb260449dd7a9b85355d4e0c9" FOREIGN KEY ("executionId") REFERENCES public.execution_entity(id) ON DELETE SET NULL;


--
-- Name: agents_observation_locks FK_6b55089892e447c2f82e5ec60ed; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agents_observation_locks
    ADD CONSTRAINT "FK_6b55089892e447c2f82e5ec60ed" FOREIGN KEY ("observationScopeId") REFERENCES public.agents_threads(id) ON DELETE CASCADE;


--
-- Name: insights_raw FK_6e2e33741adef2a7c5d66befa4e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.insights_raw
    ADD CONSTRAINT "FK_6e2e33741adef2a7c5d66befa4e" FOREIGN KEY ("metaId") REFERENCES public.insights_metadata("metaId") ON DELETE CASCADE;


--
-- Name: workflow_publish_history FK_6eab5bd9eedabe9c54bd879fc40; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_publish_history
    ADD CONSTRAINT "FK_6eab5bd9eedabe9c54bd879fc40" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- Name: dynamic_credential_user_entry FK_6edec973a6450990977bb854c38; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dynamic_credential_user_entry
    ADD CONSTRAINT "FK_6edec973a6450990977bb854c38" FOREIGN KEY ("resolverId") REFERENCES public.dynamic_credential_resolver(id) ON DELETE CASCADE;


--
-- Name: oauth_access_tokens FK_7234a36d8e49a1fa85095328845; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.oauth_access_tokens
    ADD CONSTRAINT "FK_7234a36d8e49a1fa85095328845" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: installed_nodes FK_73f857fc5dce682cef8a99c11dbddbc969618951; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.installed_nodes
    ADD CONSTRAINT "FK_73f857fc5dce682cef8a99c11dbddbc969618951" FOREIGN KEY (package) REFERENCES public.installed_packages("packageName") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: agents_memory_entry_cursors FK_746780fd115e5e4352457a3c617; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agents_memory_entry_cursors
    ADD CONSTRAINT "FK_746780fd115e5e4352457a3c617" FOREIGN KEY ("agentId") REFERENCES public.agents(id) ON DELETE CASCADE;


--
-- Name: oauth_access_tokens FK_78b26968132b7e5e45b75876481; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.oauth_access_tokens
    ADD CONSTRAINT "FK_78b26968132b7e5e45b75876481" FOREIGN KEY ("clientId") REFERENCES public.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: workflow_builder_session FK_7983c618db48f47bf5a4cc1e1e4; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_builder_session
    ADD CONSTRAINT "FK_7983c618db48f47bf5a4cc1e1e4" FOREIGN KEY ("workflowId") REFERENCES public.workflow_entity(id) ON DELETE CASCADE;


--
-- Name: chat_hub_sessions FK_7bc13b4c7e6afbfaf9be326c189; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_hub_sessions
    ADD CONSTRAINT "FK_7bc13b4c7e6afbfaf9be326c189" FOREIGN KEY ("credentialId") REFERENCES public.credentials_entity(id) ON DELETE SET NULL;


--
-- Name: folder FK_804ea52f6729e3940498bd54d78; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.folder
    ADD CONSTRAINT "FK_804ea52f6729e3940498bd54d78" FOREIGN KEY ("parentFolderId") REFERENCES public.folder(id) ON DELETE CASCADE;


--
-- Name: shared_credentials FK_812c2852270da1247756e77f5a4; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shared_credentials
    ADD CONSTRAINT "FK_812c2852270da1247756e77f5a4" FOREIGN KEY ("projectId") REFERENCES public.project(id) ON DELETE CASCADE;


--
-- Name: ai_builder_temporary_workflow FK_85a87a1ba0f61999fe11dc56325; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_builder_temporary_workflow
    ADD CONSTRAINT "FK_85a87a1ba0f61999fe11dc56325" FOREIGN KEY ("workflowId") REFERENCES public.workflow_entity(id) ON DELETE CASCADE;


--
-- Name: agent_history FK_8771675f44c58fb40e0feb9ee35; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agent_history
    ADD CONSTRAINT "FK_8771675f44c58fb40e0feb9ee35" FOREIGN KEY ("publishedById") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- Name: agents_observation_cursors FK_87aa187d27ea67eafd164905154; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agents_observation_cursors
    ADD CONSTRAINT "FK_87aa187d27ea67eafd164905154" FOREIGN KEY ("observationScopeId") REFERENCES public.agents_threads(id) ON DELETE CASCADE;


--
-- Name: agent_history FK_87cd5a8da20304b089ea2f83fec; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agent_history
    ADD CONSTRAINT "FK_87cd5a8da20304b089ea2f83fec" FOREIGN KEY ("agentId") REFERENCES public.agents(id) ON DELETE CASCADE;


--
-- Name: instance_ai_mcp_registry_connections FK_8b42c08a531d76410980c639a5b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instance_ai_mcp_registry_connections
    ADD CONSTRAINT "FK_8b42c08a531d76410980c639a5b" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: instance_ai_iteration_logs FK_8bfcc6c51fd3d69b1eae8aebd49; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instance_ai_iteration_logs
    ADD CONSTRAINT "FK_8bfcc6c51fd3d69b1eae8aebd49" FOREIGN KEY ("threadId") REFERENCES public.instance_ai_threads(id) ON DELETE CASCADE;


--
-- Name: trusted_key FK_8c2938d746943dd8f608d23c891; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trusted_key
    ADD CONSTRAINT "FK_8c2938d746943dd8f608d23c891" FOREIGN KEY ("sourceId") REFERENCES public.trusted_key_source(id) ON DELETE CASCADE;


--
-- Name: test_case_execution FK_8e4b4774db42f1e6dda3452b2af; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_case_execution
    ADD CONSTRAINT "FK_8e4b4774db42f1e6dda3452b2af" FOREIGN KEY ("testRunId") REFERENCES public.test_run(id) ON DELETE CASCADE;


--
-- Name: instance_ai_thread_grants FK_908202dbc0a9b52f669c11d730c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instance_ai_thread_grants
    ADD CONSTRAINT "FK_908202dbc0a9b52f669c11d730c" FOREIGN KEY ("threadId") REFERENCES public.instance_ai_threads(id) ON DELETE CASCADE;


--
-- Name: data_table_column FK_930b6e8faaf88294cef23484160; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.data_table_column
    ADD CONSTRAINT "FK_930b6e8faaf88294cef23484160" FOREIGN KEY ("dataTableId") REFERENCES public.data_table(id) ON DELETE CASCADE;


--
-- Name: agents FK_940597dfe9753375309ce6aeea0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agents
    ADD CONSTRAINT "FK_940597dfe9753375309ce6aeea0" FOREIGN KEY ("activeVersionId") REFERENCES public.agent_history("versionId") ON DELETE SET NULL;


--
-- Name: dynamic_credential_user_entry FK_945ba70b342a066d1306b12ccd2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dynamic_credential_user_entry
    ADD CONSTRAINT "FK_945ba70b342a066d1306b12ccd2" FOREIGN KEY ("credentialId") REFERENCES public.credentials_entity(id) ON DELETE CASCADE;


--
-- Name: folder_tag FK_94a60854e06f2897b2e0d39edba; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.folder_tag
    ADD CONSTRAINT "FK_94a60854e06f2897b2e0d39edba" FOREIGN KEY ("folderId") REFERENCES public.folder(id) ON DELETE CASCADE;


--
-- Name: agents_memory_entry_locks FK_9594c0983cfee1c8ff49b05848b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agents_memory_entry_locks
    ADD CONSTRAINT "FK_9594c0983cfee1c8ff49b05848b" FOREIGN KEY ("resourceId") REFERENCES public.agents_resources(id) ON DELETE CASCADE;


--
-- Name: execution_annotations FK_97f863fa83c4786f19565084960; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.execution_annotations
    ADD CONSTRAINT "FK_97f863fa83c4786f19565084960" FOREIGN KEY ("executionId") REFERENCES public.execution_entity(id) ON DELETE CASCADE;


--
-- Name: chat_hub_agents FK_9c61ad497dcbae499c96a6a78ba; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_hub_agents
    ADD CONSTRAINT "FK_9c61ad497dcbae499c96a6a78ba" FOREIGN KEY ("credentialId") REFERENCES public.credentials_entity(id) ON DELETE SET NULL;


--
-- Name: chat_hub_sessions FK_9f9293d9f552496c40e0d1a8f80; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_hub_sessions
    ADD CONSTRAINT "FK_9f9293d9f552496c40e0d1a8f80" FOREIGN KEY ("workflowId") REFERENCES public.workflow_entity(id) ON DELETE SET NULL;


--
-- Name: agents FK_a30d560207c4071d98aa03c179c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agents
    ADD CONSTRAINT "FK_a30d560207c4071d98aa03c179c" FOREIGN KEY ("projectId") REFERENCES public.project(id) ON DELETE CASCADE;


--
-- Name: execution_annotation_tags FK_a3697779b366e131b2bbdae2976; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.execution_annotation_tags
    ADD CONSTRAINT "FK_a3697779b366e131b2bbdae2976" FOREIGN KEY ("tagId") REFERENCES public.annotation_tag_entity(id) ON DELETE CASCADE;


--
-- Name: dynamic_credential_user_entry FK_a36dc616fabc3f736bb82410a22; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dynamic_credential_user_entry
    ADD CONSTRAINT "FK_a36dc616fabc3f736bb82410a22" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: shared_workflow FK_a45ea5f27bcfdc21af9b4188560; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shared_workflow
    ADD CONSTRAINT "FK_a45ea5f27bcfdc21af9b4188560" FOREIGN KEY ("projectId") REFERENCES public.project(id) ON DELETE CASCADE;


--
-- Name: evaluation_collection FK_a48ce930c3bc7604894b8f0eaad; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluation_collection
    ADD CONSTRAINT "FK_a48ce930c3bc7604894b8f0eaad" FOREIGN KEY ("workflowId") REFERENCES public.workflow_entity(id) ON DELETE CASCADE;


--
-- Name: workflow_dependency FK_a4ff2d9b9628ea988fa9e7d0bf8; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_dependency
    ADD CONSTRAINT "FK_a4ff2d9b9628ea988fa9e7d0bf8" FOREIGN KEY ("workflowId") REFERENCES public.workflow_entity(id) ON DELETE CASCADE;


--
-- Name: oauth_user_consents FK_a651acea2f6c97f8c4514935486; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.oauth_user_consents
    ADD CONSTRAINT "FK_a651acea2f6c97f8c4514935486" FOREIGN KEY ("clientId") REFERENCES public.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_refresh_tokens FK_a699f3ed9fd0c1b19bc2608ac53; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.oauth_refresh_tokens
    ADD CONSTRAINT "FK_a699f3ed9fd0c1b19bc2608ac53" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: dynamic_credential_entry FK_a6d1dd080958304a47a02952aab; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dynamic_credential_entry
    ADD CONSTRAINT "FK_a6d1dd080958304a47a02952aab" FOREIGN KEY (credential_id) REFERENCES public.credentials_entity(id) ON DELETE CASCADE;


--
-- Name: instance_ai_observations FK_a80e0ee839a2f10ba4b86e19998; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instance_ai_observations
    ADD CONSTRAINT "FK_a80e0ee839a2f10ba4b86e19998" FOREIGN KEY ("supersededBy") REFERENCES public.instance_ai_observations(id);


--
-- Name: folder FK_a8260b0b36939c6247f385b8221; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.folder
    ADD CONSTRAINT "FK_a8260b0b36939c6247f385b8221" FOREIGN KEY ("projectId") REFERENCES public.project(id) ON DELETE CASCADE;


--
-- Name: oauth_authorization_codes FK_aa8d3560484944c19bdf79ffa16; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.oauth_authorization_codes
    ADD CONSTRAINT "FK_aa8d3560484944c19bdf79ffa16" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: agent_files FK_aca4514cb500494b64356c2e164; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agent_files
    ADD CONSTRAINT "FK_aca4514cb500494b64356c2e164" FOREIGN KEY ("agentId") REFERENCES public.agents(id) ON DELETE CASCADE;


--
-- Name: chat_hub_messages FK_acf8926098f063cdbbad8497fd1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_hub_messages
    ADD CONSTRAINT "FK_acf8926098f063cdbbad8497fd1" FOREIGN KEY ("workflowId") REFERENCES public.workflow_entity(id) ON DELETE SET NULL;


--
-- Name: agent_execution FK_add2432fb6034cc18b6af299dce; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agent_execution
    ADD CONSTRAINT "FK_add2432fb6034cc18b6af299dce" FOREIGN KEY ("threadId") REFERENCES public.agent_execution_threads(id) ON DELETE CASCADE;


--
-- Name: oauth_refresh_tokens FK_b388696ce4d8be7ffbe8d3e4b69; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.oauth_refresh_tokens
    ADD CONSTRAINT "FK_b388696ce4d8be7ffbe8d3e4b69" FOREIGN KEY ("clientId") REFERENCES public.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: workflow_publish_history FK_b4cfbc7556d07f36ca177f5e473; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_publish_history
    ADD CONSTRAINT "FK_b4cfbc7556d07f36ca177f5e473" FOREIGN KEY ("versionId") REFERENCES public.workflow_history("versionId") ON DELETE SET NULL;


--
-- Name: agent_task_run_lock FK_b57a2862ae869aab24e54cefd48; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agent_task_run_lock
    ADD CONSTRAINT "FK_b57a2862ae869aab24e54cefd48" FOREIGN KEY ("agentId") REFERENCES public.agents(id) ON DELETE CASCADE;


--
-- Name: chat_hub_tools FK_b8030b47af9213f1fd15450fb7f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_hub_tools
    ADD CONSTRAINT "FK_b8030b47af9213f1fd15450fb7f" FOREIGN KEY ("ownerId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: instance_ai_pending_confirmations FK_ba67ee8dc311830a2eea89b6e96; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instance_ai_pending_confirmations
    ADD CONSTRAINT "FK_ba67ee8dc311830a2eea89b6e96" FOREIGN KEY ("threadId") REFERENCES public.instance_ai_threads(id) ON DELETE CASCADE;


--
-- Name: role_mapping_rule FK_bb66e404c35996b0d6946177501; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_mapping_rule
    ADD CONSTRAINT "FK_bb66e404c35996b0d6946177501" FOREIGN KEY (role) REFERENCES public.role(slug) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_secrets_provider_access FK_bd264b81209355b543878deedb1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_secrets_provider_access
    ADD CONSTRAINT "FK_bd264b81209355b543878deedb1" FOREIGN KEY ("projectId") REFERENCES public.project(id) ON DELETE CASCADE;


--
-- Name: workflow_publish_history FK_c01316f8c2d7101ec4fa9809267; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_publish_history
    ADD CONSTRAINT "FK_c01316f8c2d7101ec4fa9809267" FOREIGN KEY ("workflowId") REFERENCES public.workflow_entity(id) ON DELETE CASCADE;


--
-- Name: execution_annotation_tags FK_c1519757391996eb06064f0e7c8; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.execution_annotation_tags
    ADD CONSTRAINT "FK_c1519757391996eb06064f0e7c8" FOREIGN KEY ("annotationId") REFERENCES public.execution_annotations(id) ON DELETE CASCADE;


--
-- Name: data_table FK_c2a794257dee48af7c9abf681de; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.data_table
    ADD CONSTRAINT "FK_c2a794257dee48af7c9abf681de" FOREIGN KEY ("projectId") REFERENCES public.project(id) ON DELETE CASCADE;


--
-- Name: agents_memory_entry_sources FK_c38e8a57a36b880e39a52ada2e8; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agents_memory_entry_sources
    ADD CONSTRAINT "FK_c38e8a57a36b880e39a52ada2e8" FOREIGN KEY ("agentId") REFERENCES public.agents(id) ON DELETE CASCADE;


--
-- Name: project_relation FK_c6b99592dc96b0d836d7a21db91; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_relation
    ADD CONSTRAINT "FK_c6b99592dc96b0d836d7a21db91" FOREIGN KEY (role) REFERENCES public.role(slug);


--
-- Name: agents_memory_entry_sources FK_cb7c15d22fd068a0806aa57fc03; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agents_memory_entry_sources
    ADD CONSTRAINT "FK_cb7c15d22fd068a0806aa57fc03" FOREIGN KEY ("observationId") REFERENCES public.agents_observations(id) ON DELETE CASCADE;


--
-- Name: chat_hub_messages FK_chat_hub_messages_agentId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_hub_messages
    ADD CONSTRAINT "FK_chat_hub_messages_agentId" FOREIGN KEY ("agentId") REFERENCES public.chat_hub_agents(id) ON DELETE SET NULL;


--
-- Name: chat_hub_sessions FK_chat_hub_sessions_agentId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_hub_sessions
    ADD CONSTRAINT "FK_chat_hub_sessions_agentId" FOREIGN KEY ("agentId") REFERENCES public.chat_hub_agents(id) ON DELETE SET NULL;


--
-- Name: agents_observations FK_d206432be97b7ed88d187479b1b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agents_observations
    ADD CONSTRAINT "FK_d206432be97b7ed88d187479b1b" FOREIGN KEY ("agentId") REFERENCES public.agents(id) ON DELETE CASCADE;


--
-- Name: instance_ai_observations FK_d54fc84a6c8ac91b5e0db0378a4; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instance_ai_observations
    ADD CONSTRAINT "FK_d54fc84a6c8ac91b5e0db0378a4" FOREIGN KEY ("observationScopeId") REFERENCES public.instance_ai_threads(id) ON DELETE CASCADE;


--
-- Name: dynamic_credential_entry FK_d61a12235d268a49af6a3c09c13; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dynamic_credential_entry
    ADD CONSTRAINT "FK_d61a12235d268a49af6a3c09c13" FOREIGN KEY (resolver_id) REFERENCES public.dynamic_credential_resolver(id) ON DELETE CASCADE;


--
-- Name: evaluation_collection FK_d634a0c93fd7de68a87eab951b2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluation_collection
    ADD CONSTRAINT "FK_d634a0c93fd7de68a87eab951b2" FOREIGN KEY ("evaluationConfigId") REFERENCES public.evaluation_config(id) ON DELETE CASCADE;


--
-- Name: test_run FK_d6870d3b6e4c185d33926f423c8; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_run
    ADD CONSTRAINT "FK_d6870d3b6e4c185d33926f423c8" FOREIGN KEY ("workflowId") REFERENCES public.workflow_entity(id) ON DELETE CASCADE;


--
-- Name: shared_workflow FK_daa206a04983d47d0a9c34649ce; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shared_workflow
    ADD CONSTRAINT "FK_daa206a04983d47d0a9c34649ce" FOREIGN KEY ("workflowId") REFERENCES public.workflow_entity(id) ON DELETE CASCADE;


--
-- Name: instance_ai_observations FK_daef2195a4a846eb70eed15e039; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instance_ai_observations
    ADD CONSTRAINT "FK_daef2195a4a846eb70eed15e039" FOREIGN KEY ("parentId") REFERENCES public.instance_ai_observations(id);


--
-- Name: folder_tag FK_dc88164176283de80af47621746; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.folder_tag
    ADD CONSTRAINT "FK_dc88164176283de80af47621746" FOREIGN KEY ("tagId") REFERENCES public.tag_entity(id) ON DELETE CASCADE;


--
-- Name: role_mapping_rule_project FK_dd7ce4dfa09e95b36a626bd9de3; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_mapping_rule_project
    ADD CONSTRAINT "FK_dd7ce4dfa09e95b36a626bd9de3" FOREIGN KEY ("roleMappingRuleId") REFERENCES public.role_mapping_rule(id) ON DELETE CASCADE;


--
-- Name: workflow_published_version FK_df3428a541b802d6a63ac56e330; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_published_version
    ADD CONSTRAINT "FK_df3428a541b802d6a63ac56e330" FOREIGN KEY ("publishedVersionId") REFERENCES public.workflow_history("versionId") ON DELETE RESTRICT;


--
-- Name: instance_ai_pending_confirmations FK_df5fd25c8bbfd2b042602600d8e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instance_ai_pending_confirmations
    ADD CONSTRAINT "FK_df5fd25c8bbfd2b042602600d8e" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: user_api_keys FK_e131705cbbc8fb589889b02d457; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_api_keys
    ADD CONSTRAINT "FK_e131705cbbc8fb589889b02d457" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: chat_hub_messages FK_e22538eb50a71a17954cd7e076c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_hub_messages
    ADD CONSTRAINT "FK_e22538eb50a71a17954cd7e076c" FOREIGN KEY ("sessionId") REFERENCES public.chat_hub_sessions(id) ON DELETE CASCADE;


--
-- Name: test_case_execution FK_e48965fac35d0f5b9e7f51d8c44; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_case_execution
    ADD CONSTRAINT "FK_e48965fac35d0f5b9e7f51d8c44" FOREIGN KEY ("executionId") REFERENCES public.execution_entity(id) ON DELETE SET NULL;


--
-- Name: chat_hub_messages FK_e5d1fa722c5a8d38ac204746662; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_hub_messages
    ADD CONSTRAINT "FK_e5d1fa722c5a8d38ac204746662" FOREIGN KEY ("previousMessageId") REFERENCES public.chat_hub_messages(id) ON DELETE CASCADE;


--
-- Name: chat_hub_session_tools FK_e649bf1295f4ed8d4299ed290f9; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_hub_session_tools
    ADD CONSTRAINT "FK_e649bf1295f4ed8d4299ed290f9" FOREIGN KEY ("sessionId") REFERENCES public.chat_hub_sessions(id) ON DELETE CASCADE;


--
-- Name: agent_chat_subscriptions FK_e79153bd179c011e779d5016796; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agent_chat_subscriptions
    ADD CONSTRAINT "FK_e79153bd179c011e779d5016796" FOREIGN KEY ("agentId") REFERENCES public.agents(id) ON DELETE CASCADE;


--
-- Name: chat_hub_sessions FK_e9ecf8ede7d989fcd18790fe36a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_hub_sessions
    ADD CONSTRAINT "FK_e9ecf8ede7d989fcd18790fe36a" FOREIGN KEY ("ownerId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: user FK_eaea92ee7bfb9c1b6cd01505d56; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "FK_eaea92ee7bfb9c1b6cd01505d56" FOREIGN KEY ("roleSlug") REFERENCES public.role(slug);


--
-- Name: agent_execution_threads FK_f00b52d74fe11838e1fe086deea; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agent_execution_threads
    ADD CONSTRAINT "FK_f00b52d74fe11838e1fe086deea" FOREIGN KEY ("taskVersionId") REFERENCES public.agent_history("versionId") ON DELETE SET NULL;


--
-- Name: evaluation_collection FK_f4561f38b5a22a4f090d5cd3eae; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluation_collection
    ADD CONSTRAINT "FK_f4561f38b5a22a4f090d5cd3eae" FOREIGN KEY ("createdById") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- Name: agent_task_definition FK_f45d0535a2ed59b6c2dd6da98a0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agent_task_definition
    ADD CONSTRAINT "FK_f45d0535a2ed59b6c2dd6da98a0" FOREIGN KEY ("agentId") REFERENCES public.agents(id) ON DELETE CASCADE;


--
-- Name: evaluation_config FK_fd7542bb123074760285dc1bbf3; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluation_config
    ADD CONSTRAINT "FK_fd7542bb123074760285dc1bbf3" FOREIGN KEY ("workflowId") REFERENCES public.workflow_entity(id) ON DELETE CASCADE;


--
-- Name: instance_ai_threads FK_instance_ai_threads_projectId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instance_ai_threads
    ADD CONSTRAINT "FK_instance_ai_threads_projectId" FOREIGN KEY ("projectId") REFERENCES public.project(id) ON DELETE CASCADE;


--
-- Name: role_scope FK_role; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_scope
    ADD CONSTRAINT "FK_role" FOREIGN KEY ("roleSlug") REFERENCES public.role(slug) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: role_scope FK_scope; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_scope
    ADD CONSTRAINT "FK_scope" FOREIGN KEY ("scopeSlug") REFERENCES public.scope(slug) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: test_run FK_test_run_collection_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_run
    ADD CONSTRAINT "FK_test_run_collection_id" FOREIGN KEY ("collectionId") REFERENCES public.evaluation_collection(id) ON DELETE SET NULL;


--
-- Name: test_run FK_test_run_evaluation_config_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_run
    ADD CONSTRAINT "FK_test_run_evaluation_config_id" FOREIGN KEY ("evaluationConfigId") REFERENCES public.evaluation_config(id) ON DELETE SET NULL;


--
-- Name: auth_identity auth_identity_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_identity
    ADD CONSTRAINT "auth_identity_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- Name: credentials_entity credentials_entity_resolverId_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credentials_entity
    ADD CONSTRAINT "credentials_entity_resolverId_foreign" FOREIGN KEY ("resolverId") REFERENCES public.dynamic_credential_resolver(id) ON DELETE SET NULL;


--
-- Name: execution_data execution_data_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.execution_data
    ADD CONSTRAINT execution_data_fk FOREIGN KEY ("executionId") REFERENCES public.execution_entity(id) ON DELETE CASCADE;


--
-- Name: execution_entity fk_execution_entity_workflow_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.execution_entity
    ADD CONSTRAINT fk_execution_entity_workflow_id FOREIGN KEY ("workflowId") REFERENCES public.workflow_entity(id) ON DELETE CASCADE;


--
-- Name: webhook_entity fk_webhook_entity_workflow_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.webhook_entity
    ADD CONSTRAINT fk_webhook_entity_workflow_id FOREIGN KEY ("workflowId") REFERENCES public.workflow_entity(id) ON DELETE CASCADE;


--
-- Name: workflow_entity fk_workflow_parent_folder; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_entity
    ADD CONSTRAINT fk_workflow_parent_folder FOREIGN KEY ("parentFolderId") REFERENCES public.folder(id) ON DELETE CASCADE;


--
-- Name: workflows_tags fk_workflows_tags_tag_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflows_tags
    ADD CONSTRAINT fk_workflows_tags_tag_id FOREIGN KEY ("tagId") REFERENCES public.tag_entity(id) ON DELETE CASCADE;


--
-- Name: workflows_tags fk_workflows_tags_workflow_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflows_tags
    ADD CONSTRAINT fk_workflows_tags_workflow_id FOREIGN KEY ("workflowId") REFERENCES public.workflow_entity(id) ON DELETE CASCADE;


--
-- Name: project projects_creatorId_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project
    ADD CONSTRAINT "projects_creatorId_foreign" FOREIGN KEY ("creatorId") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict RWkza8LtxCKhgGHO6gAkNTAOzPeMeb5hKzKdN2HWlrausW2cXLm7yFG76yTwNej

--
-- Database "postgres" dump
--

\connect postgres

--
-- PostgreSQL database dump
--

\restrict yaW1giaVgGYgKbUW1HvJ1qaYfrjvISHNf2SU38j9bgJVllo5Q8GkncBYL01nhXd

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- PostgreSQL database dump complete
--

\unrestrict yaW1giaVgGYgKbUW1HvJ1qaYfrjvISHNf2SU38j9bgJVllo5Q8GkncBYL01nhXd

--
-- PostgreSQL database cluster dump complete
--

