/* NEXUS v0.53.0 — nexus-uce.js
 * UCE — Universal Code Encyclopedia
 * Phase 0B — extracted 2026-04-07
 */

(function(){
'use strict';

// ── UUID engine (deterministic, matches UCE spec) ─────────────────
function _hc(s){let h=0;for(let i=0;i<s.length;i++){h=Math.imul(31,h)+s.charCodeAt(i)|0}return h>>>0}
function uceUUID(seed){
  const h1=_hc(seed),h2=_hc(seed+'_b'),h3=_hc(seed+'_c'),h4=_hc(seed+'_d');
  const x=(n,l)=>n.toString(16).padStart(l,'0');
  return`${x(h1,8)}-${x(h2&0xffff,4)}-4${x((h2>>16)&0x0fff,3)}-${x((h3&0x3fff)|0x8000,4)}-${x(h3>>16,4)}${x(h4,8)}`;
}

// ── Domain registry ───────────────────────────────────────────────
const UCE_DOMAINS={
  lang:      {label:'Language',       cls:'uce-d-lang'},
  syntax:    {label:'Syntax',         cls:'uce-d-syntax'},
  library:   {label:'Library',        cls:'uce-d-library'},
  framework: {label:'Framework',      cls:'uce-d-framework'},
  os:        {label:'OS',             cls:'uce-d-os'},
  arch:      {label:'Architecture',   cls:'uce-d-arch'},
  infra:     {label:'Infrastructure', cls:'uce-d-infra'},
  binary:    {label:'Binary/Runtime', cls:'uce-d-binary'},
  perm:      {label:'Permission',     cls:'uce-d-perm'},
  proto:     {label:'Protocol',       cls:'uce-d-proto'},
};

// ── Colour map (CSS vars) ─────────────────────────────────────────
const UCE_COLORS={
  lang:'rgba(0,212,255,.12)',syntax:'rgba(0,255,136,.12)',library:'rgba(255,176,48,.12)',
  framework:'rgba(204,68,255,.12)',os:'rgba(255,107,53,.12)',arch:'rgba(0,212,255,.08)',
  infra:'rgba(255,45,85,.1)',binary:'rgba(150,150,150,.12)',perm:'rgba(255,45,85,.12)',
  proto:'rgba(0,212,255,.1)',
};
const UCE_BORDER={
  lang:'rgba(0,212,255,.3)',syntax:'rgba(0,255,136,.25)',library:'rgba(255,176,48,.25)',
  framework:'rgba(204,68,255,.25)',os:'rgba(255,107,53,.25)',arch:'rgba(0,212,255,.2)',
  infra:'rgba(255,45,85,.2)',binary:'rgba(150,150,150,.2)',perm:'rgba(255,45,85,.25)',
  proto:'rgba(0,212,255,.2)',
};
const UCE_TEXT={
  lang:'var(--c)',syntax:'var(--g)',library:'var(--y)',framework:'var(--m)',
  os:'var(--o)',arch:'var(--c)',infra:'var(--r)',binary:'var(--text3)',
  perm:'var(--r)',proto:'var(--c)',
};

// ── Raw DB (seed + ecosystem entries) ────────────────────────────
const UCE_RAW=[
  // ── Original 71 UCE seed entries ───────────────────────────────
  {id:'lang.python',domain:'lang',name:'Python',version:'3.x',paradigm:['imperative','oop','functional'],typing:'dynamic/strong',compiled:false,gc:true,tags:['scripting','ml','web','devops'],desc:'General-purpose interpreted language. First-class functions, duck typing, extensive stdlib.',snippet:'def add(a, b):\n    return a + b\n\nresult = add(1, 2)',bridges:['lang.ruby','lang.javascript','lang.julia','lang.r']},
  {id:'lang.javascript',domain:'lang',name:'JavaScript',version:'ES2024',paradigm:['event-driven','functional','oop','prototype'],typing:'dynamic/weak',compiled:false,gc:true,tags:['web','node','browser','fullstack'],desc:'The language of the web. Event loop, prototype inheritance, async/await.',snippet:'const add = (a, b) => a + b;\nconsole.log(add(1, 2));',bridges:['lang.typescript','lang.python','lang.php','lang.ruby']},
  {id:'lang.typescript',domain:'lang',name:'TypeScript',version:'5.x',paradigm:['typed','oop','functional'],typing:'static/strong',compiled:true,gc:true,tags:['web','node','type-safe','microsoft'],desc:'Typed superset of JavaScript. Structural typing, generics, decorators.',snippet:'const add = (a: number, b: number): number => a + b;',bridges:['lang.javascript','lang.java','lang.csharp','lang.kotlin']},
  {id:'lang.rust',domain:'lang',name:'Rust',version:'1.78',paradigm:['systems','functional','concurrent'],typing:'static/strong',compiled:true,gc:false,tags:['systems','wasm','embedded','safe'],desc:'Memory-safe systems language. Ownership model eliminates data races.',snippet:'fn add(a: i32, b: i32) -> i32 { a + b }',bridges:['lang.c','lang.cpp','lang.go','lang.zig']},
  {id:'lang.go',domain:'lang',name:'Go',version:'1.22',paradigm:['concurrent','imperative','compiled'],typing:'static/strong',compiled:true,gc:true,tags:['cloud','microservices','networking','google'],desc:'Compiled language with goroutines for concurrency.',snippet:'func add(a, b int) int { return a + b }',bridges:['lang.rust','lang.java','lang.python']},
  {id:'lang.java',domain:'lang',name:'Java',version:'21 LTS',paradigm:['oop','concurrent','compiled'],typing:'static/strong',compiled:true,gc:true,tags:['enterprise','android','jvm','oracle'],desc:'Write once run anywhere. JVM-based, strong OOP.',snippet:'static int add(int a, int b) { return a+b; }',bridges:['lang.kotlin','lang.scala','lang.csharp','lang.typescript']},
  {id:'lang.kotlin',domain:'lang',name:'Kotlin',version:'2.0',paradigm:['oop','functional','null-safe'],typing:'static/strong',compiled:true,gc:true,tags:['android','jvm','multiplatform','jetbrains'],desc:'Modern JVM/multiplatform language. Null safety, coroutines.',snippet:'fun add(a: Int, b: Int) = a + b',bridges:['lang.java','lang.swift','lang.typescript']},
  {id:'lang.swift',domain:'lang',name:'Swift',version:'5.10',paradigm:['oop','functional','protocol'],typing:'static/strong',compiled:true,gc:false,tags:['ios','macos','apple','safety'],desc:'Apple ecosystem language. ARC memory management, protocol-oriented.',snippet:'func add(_ a: Int, _ b: Int) -> Int { a + b }',bridges:['lang.kotlin','lang.rust','lang.cpp']},
  {id:'lang.c',domain:'lang',name:'C',version:'C17',paradigm:['procedural','low-level','systems'],typing:'static/weak',compiled:true,gc:false,tags:['systems','kernel','embedded','posix'],desc:'Foundation of modern computing. Manual memory, direct hardware access.',snippet:'int add(int a, int b) { return a+b; }',bridges:['lang.cpp','lang.rust','lang.zig','lang.assembly']},
  {id:'lang.cpp',domain:'lang',name:'C++',version:'C++23',paradigm:['oop','generic','systems','functional'],typing:'static/strong',compiled:true,gc:false,tags:['games','systems','hpc','embedded'],desc:'C superset with OOP, templates, RAII. Zero-overhead abstractions.',snippet:'int add(int a, int b) { return a+b; }',bridges:['lang.c','lang.rust','lang.java']},
  {id:'lang.csharp',domain:'lang',name:'C#',version:'12',paradigm:['oop','functional','component'],typing:'static/strong',compiled:true,gc:true,tags:['dotnet','enterprise','unity','microsoft'],desc:'.NET ecosystem. LINQ, async/await, records, nullable reference types.',snippet:'int Add(int a, int b) => a + b;',bridges:['lang.java','lang.typescript','lang.kotlin']},
  {id:'lang.ruby',domain:'lang',name:'Ruby',version:'3.3',paradigm:['oop','functional','dynamic'],typing:'dynamic/strong',compiled:false,gc:true,tags:['web','scripting','rails','matz'],desc:'Everything is an object. Blocks/procs/lambdas, metaprogramming.',snippet:'def add(a, b) = a + b',bridges:['lang.python','lang.javascript','lang.elixir']},
  {id:'lang.php',domain:'lang',name:'PHP',version:'8.3',paradigm:['oop','procedural','web'],typing:'dynamic/weak',compiled:false,gc:true,tags:['web','cms','wordpress','server'],desc:'Server-side web language. JIT in 8.0, fibers, union types, enums.',snippet:'function add(int $a, int $b): int { return $a + $b; }',bridges:['lang.python','lang.ruby','lang.javascript']},
  {id:'lang.r',domain:'lang',name:'R',version:'4.4',paradigm:['statistical','functional','array'],typing:'dynamic/weak',compiled:false,gc:true,tags:['statistics','datascience','bioinformatics','plotting'],desc:'Language for statistical computing. Vector/matrix ops, CRAN.',snippet:'add <- function(a, b) a + b',bridges:['lang.python','lang.julia','lang.matlab']},
  {id:'lang.julia',domain:'lang',name:'Julia',version:'1.10',paradigm:['scientific','functional','jit'],typing:'dynamic/optional-static',compiled:false,gc:true,tags:['hpc','scientific','ml','numeric'],desc:'High-performance numerical computing. JIT via LLVM, near-C speed.',snippet:'add(a, b) = a + b',bridges:['lang.python','lang.r','lang.fortran']},
  {id:'lang.haskell',domain:'lang',name:'Haskell',version:'GHC 9.8',paradigm:['pure-functional','lazy','typed'],typing:'static/strong/inferred',compiled:true,gc:true,tags:['functional','academia','compiler','fp'],desc:'Pure lazy functional. Hindley-Milner, monads, type classes.',snippet:'add :: Int -> Int -> Int\nadd a b = a + b',bridges:['lang.ocaml','lang.scala','lang.fsharp','lang.elm']},
  {id:'lang.scala',domain:'lang',name:'Scala',version:'3.x',paradigm:['functional','oop','typed'],typing:'static/strong/inferred',compiled:true,gc:true,tags:['jvm','spark','big-data','fp'],desc:'JVM language fusing OOP and FP. Akka, Spark.',snippet:'def add(a: Int, b: Int): Int = a + b',bridges:['lang.haskell','lang.kotlin','lang.java']},
  {id:'lang.elixir',domain:'lang',name:'Elixir',version:'1.17',paradigm:['functional','concurrent','actor'],typing:'dynamic/strong',compiled:false,gc:true,tags:['beam','phoenix','real-time','erlang'],desc:'BEAM-based functional language. Actor model, fault-tolerance, Phoenix.',snippet:'def add(a, b), do: a + b',bridges:['lang.erlang','lang.ruby','lang.rust']},
  {id:'lang.lua',domain:'lang',name:'Lua',version:'5.4',paradigm:['scripting','oop-via-tables','embeddable'],typing:'dynamic/weak',compiled:false,gc:true,tags:['embedded','games','scripting','neovim'],desc:'Lightweight embeddable scripting. Metatables for OOP, coroutines.',snippet:'local function add(a, b) return a + b end',bridges:['lang.python','lang.javascript','lang.c']},
  {id:'lang.assembly',domain:'lang',name:'Assembly (x86-64)',version:'AMD64',paradigm:['low-level','procedural','register'],typing:'untyped',compiled:true,gc:false,tags:['systems','kernel','exploit','embedded'],desc:'Direct CPU instruction encoding. Registers, syscalls, calling conventions.',snippet:'add:\n    mov eax, edi\n    add eax, esi\n    ret',bridges:['lang.c','lang.rust','lang.zig','arch.x86_64']},
  {id:'lang.zig',domain:'lang',name:'Zig',version:'0.13',paradigm:['systems','imperative','comptime'],typing:'static/strong',compiled:true,gc:false,tags:['systems','embedded','c-replacement','safe'],desc:'C replacement with comptime evaluation, explicit allocators.',snippet:'fn add(a: i32, b: i32) i32 { return a + b; }',bridges:['lang.c','lang.rust','lang.assembly']},
  {id:'lang.wasm',domain:'lang',name:'WebAssembly',version:'2.0',paradigm:['stack-machine','binary','portable'],typing:'static/typed',compiled:true,gc:false,tags:['browser','portable','native-speed','universal'],desc:'Binary instruction format. Near-native speed in browser and server (WASI).',snippet:'(func $add (param i32 i32) (result i32)\n  local.get 0\n  local.get 1\n  i32.add)',bridges:['lang.rust','lang.c','lang.cpp','lang.zig']},
  {id:'lang.sql',domain:'lang',name:'SQL',version:'SQL:2023',paradigm:['declarative','relational','query'],typing:'static/typed',compiled:false,gc:false,tags:['database','query','rdbms','analytics'],desc:'Structured Query Language. DDL/DML/DCL/TCL, window functions, CTEs.',snippet:'SELECT a + b AS result FROM (VALUES (1, 2)) AS t(a, b);',bridges:['lang.python','lang.r','infra.postgresql','infra.sqlite']},
  {id:'lang.bash',domain:'lang',name:'Bash',version:'5.x',paradigm:['scripting','pipeline','interactive'],typing:'untyped/string',compiled:false,gc:false,tags:['shell','automation','devops','posix'],desc:'Unix shell and scripting. Pipes, redirection, process substitution.',snippet:'add() { echo $(($1 + $2)); }\nadd 1 2',bridges:['lang.python','lang.powershell','os.linux']},
  {id:'syntax.closure',domain:'syntax',name:'Closure',version:'universal',paradigm:['functional','lexical-scope'],tags:['fp','higher-order','state','capture'],desc:'Function capturing variables from enclosing scope. Enables partial application, encapsulation.',snippet:'const counter = () => {\n  let n = 0;\n  return () => ++n;\n};',bridges:['syntax.lambda','syntax.currying','syntax.hof']},
  {id:'syntax.lambda',domain:'syntax',name:'Lambda / Anonymous Function',version:'universal',paradigm:['functional'],tags:['fp','inline','callback'],desc:'Unnamed function expression. First-class value.',snippet:'add = lambda a, b: a + b',bridges:['syntax.closure','syntax.hof','syntax.arrow-fn']},
  {id:'syntax.generator',domain:'syntax',name:'Generator / Iterator Protocol',version:'universal',paradigm:['lazy','streaming','coroutine'],tags:['lazy','memory','stream','coroutine'],desc:'Lazy sequence producer. Yields values on demand.',snippet:'def infinite_count(start=0):\n    n = start\n    while True:\n        yield n\n        n += 1',bridges:['syntax.coroutine','syntax.async-await']},
  {id:'syntax.async-await',domain:'syntax',name:'Async / Await',version:'universal',paradigm:['async','concurrent','non-blocking'],tags:['async','io','concurrency','syntax-sugar'],desc:'Syntactic sugar over promises/futures. Non-blocking I/O.',snippet:'async function fetchUser(id) {\n  const res = await fetch(`/api/users/${id}`);\n  return res.json();\n}',bridges:['syntax.generator','syntax.promise']},
  {id:'syntax.monad',domain:'syntax',name:'Monad',version:'universal',paradigm:['functional','pure','composition'],tags:['fp','composition','effect','type-class'],desc:'Design pattern from category theory. Wraps values with context (Maybe, IO, List).',snippet:'getLine >>= \\name ->\nputStrLn ("Hello, " ++ name)',bridges:['syntax.functor','lang.haskell','lang.scala']},
  {id:'syntax.macro',domain:'syntax',name:'Macro / Metaprogramming',version:'universal',paradigm:['meta','compile-time','code-generation'],tags:['meta','codegen','dsl','compile-time'],desc:'Code that writes or transforms code. Syntactic macros, proc macros.',snippet:'#[derive(Debug, Clone)]\nstruct Point { x: f64, y: f64 }',bridges:['lang.rust','lang.lisp','lang.clojure']},
  {id:'syntax.pattern-matching',domain:'syntax',name:'Pattern Matching',version:'universal',paradigm:['declarative','destructuring'],tags:['destructure','exhaustive','type-narrowing'],desc:'Structural decomposition with exhaustiveness checking.',snippet:'match shape {\n    Shape::Circle(r) => PI * r * r,\n    Shape::Rect(w, h) => w * h,\n}',bridges:['lang.rust','lang.haskell','lang.scala','lang.swift']},
  {id:'syntax.generics',domain:'syntax',name:'Generics / Parametric Polymorphism',version:'universal',paradigm:['typed','reuse','polymorphism'],tags:['type-param','polymorphism','reuse','abstraction'],desc:'Type-parameterized code. Write once, use for any type satisfying constraints.',snippet:'function identity<T>(arg: T): T {\n  return arg;\n}',bridges:['lang.java','lang.typescript','lang.rust','lang.cpp']},
  {id:'lib.numpy',domain:'library',name:'NumPy',version:'2.0',paradigm:['array','numeric','vectorized'],tags:['python','scientific','array','ml'],desc:'Fundamental array computing for Python. N-dimensional arrays, broadcasting, FFT.',snippet:'import numpy as np\na = np.array([1,2,3])\nprint(a @ a)',bridges:['lib.pytorch','lib.scipy','lib.pandas','lang.python']},
  {id:'lib.react',domain:'library',name:'React',version:'19',paradigm:['component','declarative','virtual-dom'],tags:['ui','frontend','jsx','meta'],desc:'Component-based UI library. Virtual DOM, hooks, concurrent mode, server components.',snippet:'function Counter() {\n  const [n, setN] = useState(0);\n  return <button onClick={() => setN(n+1)}>{n}</button>;\n}',bridges:['framework.nextjs','lib.vue','lang.typescript']},
  {id:'lib.pytorch',domain:'library',name:'PyTorch',version:'2.3',paradigm:['tensor','autograd','neural-net'],tags:['ml','gpu','deep-learning','meta'],desc:'Dynamic neural network framework. Eager execution, autograd, TorchScript.',snippet:'x = torch.tensor([1.,2.,3.], requires_grad=True)\nloss = (x**2).sum()\nloss.backward()',bridges:['lib.numpy','lib.jax','lang.python']},
  {id:'lib.pandas',domain:'library',name:'Pandas',version:'2.2',paradigm:['dataframe','tabular','analysis'],tags:['python','data','etl','analysis'],desc:'DataFrame library. groupby, merge/join, time series, Arrow backend.',snippet:'df = pd.DataFrame({"a":[1,2],"b":[3,4]})\ndf["c"] = df["a"] + df["b"]',bridges:['lib.numpy','lang.python','lang.r']},
  {id:'lib.tokio',domain:'library',name:'Tokio',version:'1.38',paradigm:['async','runtime','network'],tags:['rust','async','network','concurrent'],desc:'Asynchronous runtime for Rust. Green threads, I/O reactor, channels.',snippet:'#[tokio::main]\nasync fn main() {\n    let res = reqwest::get("https://api.example.com").await.unwrap();\n}',bridges:['lang.rust','syntax.async-await']},
  {id:'framework.nextjs',domain:'framework',name:'Next.js',version:'14',paradigm:['fullstack','ssr','rsc'],tags:['react','web','vercel','fullstack'],desc:'React meta-framework. App Router, RSC, streaming SSR, server actions.',snippet:'export default async function Page() {\n  const data = await fetch("/api/data").then(r=>r.json());\n  return <main>{data.title}</main>;\n}',bridges:['lib.react','lang.typescript']},
  {id:'framework.django',domain:'framework',name:'Django',version:'5.0',paradigm:['mvc','batteries','orm'],tags:['python','web','admin','orm'],desc:'Batteries-included Python web framework. ORM, admin, auth, async views.',snippet:'class Article(models.Model):\n    title = models.CharField(max_length=200)',bridges:['lang.python','framework.fastapi','infra.postgresql']},
  {id:'framework.fastapi',domain:'framework',name:'FastAPI',version:'0.111',paradigm:['api','async','typed'],tags:['python','api','openapi','uvicorn'],desc:'Modern Python API framework. Auto OpenAPI, Pydantic v2, async/sync.',snippet:'@app.get("/add/{a}/{b}")\nasync def add(a: int, b: int) -> dict:\n    return {"result": a+b}',bridges:['lang.python','framework.django']},
  {id:'framework.rails',domain:'framework',name:'Ruby on Rails',version:'7.2',paradigm:['mvc','convention','full-stack'],tags:['ruby','web','orm','rapid'],desc:'Full-stack MVC framework. ActiveRecord, Hotwire, convention over configuration.',snippet:'class ArticlesController < ApplicationController\n  def create\n    @article = Article.new(article_params)\n    redirect_to @article if @article.save\n  end\nend',bridges:['lang.ruby','infra.postgresql']},
  {id:'framework.spring',domain:'framework',name:'Spring Boot',version:'3.3',paradigm:['ioc','di','enterprise'],tags:['java','enterprise','api','microservices'],desc:'Java enterprise framework. IoC, Spring MVC, Data JPA, Security.',snippet:'@RestController\npublic class AddController {\n    @GetMapping("/add")\n    public int add(@RequestParam int a, @RequestParam int b) { return a + b; }\n}',bridges:['lang.java','infra.postgresql','binary.jvm']},
  {id:'framework.kubernetes',domain:'framework',name:'Kubernetes',version:'1.30',paradigm:['orchestration','declarative','cloud-native'],tags:['k8s','container','cloud','orchestration'],desc:'Container orchestration. Pods, deployments, services, ingress, HPA.',snippet:'apiVersion: apps/v1\nkind: Deployment\nspec:\n  replicas: 3',bridges:['binary.docker','infra.etcd','lang.go']},
  {id:'os.linux',domain:'os',name:'Linux Kernel',version:'6.9',paradigm:['monolithic','posix','preemptive'],tags:['kernel','syscall','driver','open-source'],desc:'Monolithic kernel. CFS scheduler, VFS, network stack, eBPF, namespaces/cgroups.',snippet:'uname -r\nstrace -e trace=read,write cat /etc/hostname',bridges:['binary.glibc','perm.linux-capabilities']},
  {id:'os.windows',domain:'os',name:'Windows NT Kernel',version:'11 / NT 10.0',paradigm:['hybrid','win32','ntfs'],tags:['microsoft','win32','registry','driver'],desc:'Hybrid kernel. NT object manager, WinAPI, NTFS, WSL2, Hyper-V.',snippet:'Get-Process | Sort-Object CPU -Desc | Select-Object -First 10',bridges:['binary.clr','lang.csharp','perm.windows-acl']},
  {id:'os.macos',domain:'os',name:'macOS / XNU',version:'Sonoma 14',paradigm:['hybrid','unix','mach'],tags:['apple','darwin','mach','posix'],desc:'XNU hybrid kernel (Mach + BSD). APFS, Secure Enclave, Rosetta 2.',snippet:'sysctl hw.physicalcpu\nsysctl kern.osproductversion',bridges:['lang.swift','perm.macos-sandbox']},
  {id:'os.freebsd',domain:'os',name:'FreeBSD',version:'14.1',paradigm:['monolithic','posix','bsd'],tags:['bsd','server','zfs','netflix'],desc:'BSD Unix. ZFS, jails, dtrace, capsicum capability model.',snippet:'jail -c name=myjail path=/jail/myjail ip4.addr=10.0.0.2 command=/bin/sh',bridges:['perm.posix','binary.bsd-libc']},
  {id:'arch.x86_64',domain:'arch',name:'x86-64 (AMD64)',version:'AVX-512',paradigm:['cisc','register','von-neumann'],tags:['intel','amd','desktop','server'],desc:'Dominant server/desktop ISA. 16 registers, SSE/AVX SIMD, paging, rings 0-3.',snippet:'; Linux x86-64 syscall: write\nmov rax, 1\nmov rdi, 1\nmov rsi, msg\nmov rdx, 13\nsyscall',bridges:['arch.arm64','lang.assembly','os.linux','binary.elf']},
  {id:'arch.arm64',domain:'arch',name:'ARM64 / AArch64',version:'ARMv9',paradigm:['risc','load-store','fixed-width'],tags:['mobile','apple-silicon','embedded','server'],desc:'RISC ISA. 31 GPRs, NEON/SVE SIMD, TrustZone, MTE memory tagging.',snippet:'ADD X0, X0, X1\nRET',bridges:['arch.x86_64','arch.riscv','lang.assembly']},
  {id:'arch.riscv',domain:'arch',name:'RISC-V',version:'RV64GCV',paradigm:['risc','open','modular'],tags:['open-source','embedded','academic','custom'],desc:'Open ISA. Modular extensions, no royalties, growing ecosystem.',snippet:'add a0, a0, a1\nret',bridges:['arch.arm64','arch.x86_64','lang.assembly']},
  {id:'arch.microservices',domain:'arch',name:'Microservices Architecture',version:'cloud-native',paradigm:['distributed','decoupled','scalable'],tags:['distributed','api','service-mesh','scaling'],desc:'System of small, independently deployable services. Each owns its data.',snippet:'services:\n  auth:\n    image: auth-service:latest\n    ports: ["8081:8080"]',bridges:['framework.kubernetes','proto.grpc','infra.kafka']},
  {id:'arch.event-driven',domain:'arch',name:'Event-Driven Architecture',version:'universal',paradigm:['async','reactive','decoupled'],tags:['events','streaming','pub-sub','cqrs'],desc:'Components communicate via events. Enables CQRS, event sourcing, sagas.',snippet:'emitter.on("order.placed", async (order) => {\n  await inventory.reserve(order);\n});',bridges:['infra.kafka','proto.amqp','arch.microservices']},
  {id:'infra.postgresql',domain:'infra',name:'PostgreSQL',version:'16',paradigm:['rdbms','acid','extensible'],tags:['database','sql','json','open-source'],desc:'Advanced open-source RDBMS. MVCC, JSONB, PostGIS, full-text search.',snippet:'CREATE TABLE events (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  payload JSONB\n);',bridges:['lang.sql','infra.redis','infra.sqlite']},
  {id:'infra.redis',domain:'infra',name:'Redis',version:'7.2',paradigm:['in-memory','cache','pub-sub'],tags:['cache','session','queue','pub-sub'],desc:'In-memory data structure store. Strings, hashes, lists, sorted sets, streams.',snippet:'SET session:user:123 "{}" EX 3600\nXADD events * type "user.login"',bridges:['infra.postgresql','infra.kafka']},
  {id:'infra.kafka',domain:'infra',name:'Apache Kafka',version:'3.7',paradigm:['streaming','log','distributed'],tags:['streaming','event','queue','confluent'],desc:'Distributed event streaming. Partitioned append-only log, consumer groups.',snippet:'kafka-topics.sh --create --topic events --partitions 12',bridges:['arch.event-driven','infra.redis','lang.java']},
  {id:'infra.sqlite',domain:'infra',name:'SQLite',version:'3.46',paradigm:['embedded','serverless','rdbms'],tags:['embedded','local','single-file','portable'],desc:'Serverless embedded SQL. Single file, zero config, WAL mode, FTS5.',snippet:'CREATE TABLE kv (\n  key TEXT PRIMARY KEY,\n  value TEXT NOT NULL\n) STRICT;',bridges:['lang.sql','infra.postgresql','lang.python','lang.rust']},
  {id:'infra.etcd',domain:'infra',name:'etcd',version:'3.5',paradigm:['distributed','consensus','kv'],tags:['raft','kubernetes','config','distributed'],desc:'Distributed key-value store. Raft consensus, watch API, leases.',snippet:'etcdctl put /config/db/host "postgres.svc"',bridges:['framework.kubernetes','proto.grpc','lang.go']},
  {id:'binary.jvm',domain:'binary',name:'JVM (HotSpot)',version:'Java 21',paradigm:['bytecode','jit','gc'],tags:['java','jit','gc','oracle'],desc:'Java Virtual Machine. Bytecode + JIT (C1/C2/Graal), GC (G1/ZGC/Shenandoah).',snippet:'java -XX:+UseZGC -jar app.jar',bridges:['lang.java','lang.kotlin','lang.scala']},
  {id:'binary.docker',domain:'binary',name:'Docker / containerd',version:'26 / 1.7',paradigm:['container','image','oci'],tags:['container','oci','image','isolation'],desc:'OCI-compliant container runtime. Namespaces + cgroups, layered images, BuildKit.',snippet:'FROM rust:1.78-slim as builder\nWORKDIR /app\nCOPY . .\nRUN cargo build --release',bridges:['framework.kubernetes','os.linux','perm.linux-capabilities']},
  {id:'binary.elf',domain:'binary',name:'ELF (Executable and Linkable Format)',version:'ELF64',paradigm:['binary','linking','loading'],tags:['linux','binary','linker','dynamic'],desc:'Standard binary format for Linux/Unix. Sections, segments, symbol tables.',snippet:'readelf -h ./binary\nobjdump -d ./binary | head -30',bridges:['arch.x86_64','arch.arm64','os.linux','binary.glibc']},
  {id:'binary.glibc',domain:'binary',name:'glibc',version:'2.39',paradigm:['libc','posix','syscall-wrapper'],tags:['linux','libc','posix','c'],desc:'GNU C Library. POSIX API over Linux syscalls. malloc, pthreads, locale.',snippet:'#include <stdio.h>\nint main() { puts("Hello UCE!"); }',bridges:['os.linux','lang.c','binary.elf']},
  {id:'perm.posix',domain:'perm',name:'POSIX Permissions (rwx)',version:'POSIX.1-2017',paradigm:['unix','owner-group-other','bits'],tags:['linux','macos','bsd','file'],desc:'Classic Unix permission model. 9 bits (rwxrwxrwx), setuid/setgid/sticky.',snippet:'chmod 750 /app/secret\nchown root:staff /app/secret',bridges:['os.linux','os.freebsd','perm.linux-capabilities']},
  {id:'perm.linux-capabilities',domain:'perm',name:'Linux Capabilities',version:'Linux 6.x',paradigm:['fine-grained','privilege','kernel'],tags:['linux','security','privilege','cap'],desc:'Fine-grained privilege splitting. CAP_NET_BIND_SERVICE, CAP_SYS_ADMIN etc.',snippet:'setcap cap_net_bind_service=+eip /usr/bin/myapp\ngetcap /usr/bin/myapp',bridges:['os.linux','perm.posix','binary.docker']},
  {id:'perm.windows-acl',domain:'perm',name:'Windows ACL (DACL/SACL)',version:'Windows 11',paradigm:['ace','object-security','sid'],tags:['windows','ntfs','security','sid'],desc:'Discretionary/System ACLs on securable objects. ACEs grant/deny to SIDs.',snippet:'$acl = Get-Acl "C:\\Data"\nSet-Acl "C:\\Data" $acl',bridges:['os.windows','perm.posix']},
  {id:'perm.macos-sandbox',domain:'perm',name:'macOS Sandbox / TCC',version:'macOS 14',paradigm:['capability','entitlement','xnu'],tags:['apple','entitlement','privacy','tcc'],desc:'Sandbox profiles restrict process syscalls. TCC gates privacy-sensitive resources.',snippet:'<key>com.apple.security.network.client</key><true/>',bridges:['os.macos','perm.posix','lang.swift']},
  {id:'perm.seccomp',domain:'perm',name:'seccomp-bpf',version:'Linux 6.x',paradigm:['syscall-filter','ebpf','sandbox'],tags:['linux','security','syscall','docker'],desc:'Secure computing mode. BPF-based syscall allowlist/denylist.',snippet:'docker run --security-opt seccomp=default.json alpine',bridges:['os.linux','perm.linux-capabilities','binary.docker']},
  {id:'proto.grpc',domain:'proto',name:'gRPC',version:'1.64',paradigm:['rpc','binary','streaming'],tags:['protobuf','rpc','http2','google'],desc:'High-performance RPC using HTTP/2 and Protocol Buffers. Bidirectional streaming.',snippet:'service UserService {\n  rpc GetUser (GetUserRequest) returns (User);\n}',bridges:['proto.protobuf','proto.http','lang.go','lang.java']},
  {id:'proto.protobuf',domain:'proto',name:'Protocol Buffers',version:'proto3',paradigm:['serialization','schema','binary'],tags:['binary','schema','google','compact'],desc:'Language-neutral binary serialization. Field numbers, wire types, oneof.',snippet:'message User {\n  string id = 1;\n  string name = 2;\n}',bridges:['proto.grpc','lang.python','lang.java','lang.rust']},
  {id:'proto.http',domain:'proto',name:'HTTP/1.1 + HTTP/2 + HTTP/3',version:'RFC 9110',paradigm:['request-response','stateless','text+binary'],tags:['web','api','rest','quic'],desc:'HyperText Transfer Protocol. HTTP/2 multiplexing; HTTP/3 uses QUIC.',snippet:'GET /api/users/123 HTTP/2\nHost: api.example.com\nAuthorization: Bearer eyJ...',bridges:['proto.grpc','proto.websocket','arch.microservices']},
  {id:'proto.websocket',domain:'proto',name:'WebSocket',version:'RFC 6455',paradigm:['full-duplex','persistent','event'],tags:['real-time','browser','push','streaming'],desc:'Full-duplex communication over TCP. Upgrades from HTTP.',snippet:'const ws = new WebSocket("wss://api.example.com/ws");\nws.onmessage = e => console.log(JSON.parse(e.data));',bridges:['proto.http','lang.javascript','lang.elixir']},
  {id:'proto.avro',domain:'proto',name:'Apache Avro',version:'1.11',paradigm:['serialization','schema','kafka'],tags:['kafka','schema','json-schema','big-data'],desc:'Row-based serialization with schema evolution. JSON schema, compact binary.',snippet:'{"type":"record","name":"Event","fields":[{"name":"id","type":"string"}]}',bridges:['proto.protobuf','infra.kafka','lang.java']},

  // ── Android ecosystem ───────────────────────────────────────────
  {id:'android.kotlin',domain:'lang',name:'Kotlin for Android',version:'2.0',paradigm:['oop','functional','null-safe'],tags:['android','kotlin','jvm','google'],desc:'Primary language for Android. Coroutines, null safety, extension functions.',snippet:'class MainActivity : AppCompatActivity() {\n    override fun onCreate(s: Bundle?) {\n        super.onCreate(s)\n        setContentView(R.layout.activity_main)\n    }\n}',bridges:['android.activity','android.jetpack','lang.kotlin']},
  {id:'android.jetpack-compose',domain:'framework',name:'Jetpack Compose',version:'1.6',paradigm:['declarative','reactive','component'],tags:['android','ui','declarative','google'],desc:'Modern declarative UI toolkit. Composable functions, state-driven recomposition, Material3.',snippet:'@Composable\nfun Greeting(name: String) {\n    Text(text = "Hello $name!")\n}',bridges:['android.material3','android.viewmodel','android.state']},
  {id:'android.viewmodel',domain:'library',name:'ViewModel',version:'2.8',paradigm:['mvvm','state','lifecycle-aware'],tags:['android','architecture','mvvm','state'],desc:'Lifecycle-aware state holder. Survives configuration changes. Exposes StateFlow.',snippet:'class CounterViewModel : ViewModel() {\n    private val _count = MutableStateFlow(0)\n    val count = _count.asStateFlow()\n    fun increment() { _count.update { it + 1 } }\n}',bridges:['android.stateflow','android.livedata','android.hilt']},
  {id:'android.room',domain:'library',name:'Room',version:'2.6',paradigm:['orm','sqlite','reactive'],tags:['android','database','sqlite','jetpack'],desc:'SQLite ORM for Android. @Entity, @Dao, @Database. Kotlin Flow queries.',snippet:'@Dao interface UserDao {\n    @Query("SELECT * FROM user")\n    fun getAll(): Flow<List<User>>\n}',bridges:['android.viewmodel','android.coroutines','infra.sqlite']},
  {id:'android.hilt',domain:'library',name:'Hilt',version:'2.51',paradigm:['di','injection','component'],tags:['android','di','dependency-injection','dagger'],desc:'Dependency injection for Android. Built on Dagger. @HiltViewModel, @Inject.',snippet:'@HiltViewModel\nclass UserViewModel @Inject constructor(\n    private val repo: UserRepository\n) : ViewModel()',bridges:['android.viewmodel','android.room']},
  {id:'android.retrofit',domain:'library',name:'Retrofit',version:'2.11',paradigm:['rest','http','interface'],tags:['android','networking','rest','http'],desc:'Type-safe HTTP client. Interface-based API definition, coroutine support.',snippet:'interface ApiService {\n    @GET("users/{id}")\n    suspend fun getUser(@Path("id") id: Int): User\n}',bridges:['android.okhttp','android.coroutines']},
  {id:'android.coroutines',domain:'library',name:'Kotlin Coroutines',version:'1.8',paradigm:['async','concurrent','structured'],tags:['android','kotlin','async','concurrent'],desc:'Structured concurrency. launch, async, Flow. viewModelScope/lifecycleScope.',snippet:'viewModelScope.launch {\n    val user = withContext(Dispatchers.IO) { api.getUser(id) }\n    _state.update { it.copy(user = user) }\n}',bridges:['android.viewmodel','android.stateflow']},
  {id:'android.jetpack',domain:'framework',name:'Android Jetpack',version:'2024',paradigm:['component','library-set','architecture'],tags:['android','jetpack','google','architecture'],desc:'Suite: Compose, ViewModel, Room, Navigation, WorkManager, DataStore, Hilt.',snippet:'// Typical stack:\n// UI: Jetpack Compose\n// State: ViewModel + StateFlow\n// DB: Room · DI: Hilt · Nav: Navigation Compose',bridges:['android.jetpack-compose','android.viewmodel','android.room','android.hilt']},
  {id:'android.activity',domain:'library',name:'Activity',version:'API 34',paradigm:['lifecycle','component','ui'],tags:['android','lifecycle','navigation','component'],desc:'Core UI component. Lifecycle: onCreate→onStart→onResume→onPause→onStop→onDestroy.',snippet:'class DetailActivity : AppCompatActivity() {\n    override fun onStart() { super.onStart() }\n    override fun onStop() { super.onStop() }\n}',bridges:['android.fragment','android.intent','android.viewmodel']},
  {id:'android.navigation',domain:'library',name:'Navigation Component',version:'2.8',paradigm:['graph','back-stack','destination'],tags:['android','navigation','graph','jetpack'],desc:'Jetpack navigation. NavGraph, back stack management, deep links, safe args.',snippet:'NavHost(navController, startDestination = "home") {\n    composable("home") { HomeScreen(navController) }\n}',bridges:['android.fragment','android.jetpack-compose']},
  {id:'android.workmanager',domain:'library',name:'WorkManager',version:'2.9',paradigm:['background','scheduled','constraint'],tags:['android','background','worker','jetpack'],desc:'Guaranteed background work. Constraint-based scheduling, chaining, persistence.',snippet:'val request = OneTimeWorkRequestBuilder<SyncWorker>()\n    .setConstraints(constraints)\n    .build()',bridges:['android.coroutines','android.hilt']},

  // ── Python ecosystem ────────────────────────────────────────────
  {id:'python.asyncio',domain:'library',name:'asyncio',version:'3.12',paradigm:['async','event-loop','concurrent'],tags:['python','stdlib','async','concurrent'],desc:'Async I/O event loop. async/await, Task, gather, Queue, Lock.',snippet:'async def main():\n    results = await asyncio.gather(fetch("url1"), fetch("url2"))\nasyncio.run(main())',bridges:['python.aiohttp','python.httpx','python.trio']},
  {id:'python.pydantic',domain:'library',name:'Pydantic',version:'2.7',paradigm:['validation','typed','serialization'],tags:['python','validation','typed','fastapi'],desc:'Data validation via type hints. BaseModel, Field, validators, JSON schema.',snippet:'class User(BaseModel):\n    name: str = Field(min_length=2)\n    age: int = Field(ge=0, le=150)',bridges:['python.typing','python.dataclasses','framework.fastapi']},
  {id:'python.sqlalchemy',domain:'library',name:'SQLAlchemy',version:'2.0',paradigm:['orm','sql','declarative'],tags:['python','orm','database','sql'],desc:'Python SQL toolkit and ORM. Core + ORM, async support in 2.0.',snippet:'class User(Base):\n    __tablename__ = "users"\n    id: Mapped[int] = mapped_column(primary_key=True)',bridges:['python.pydantic','infra.postgresql','infra.sqlite']},
  {id:'python.fastapi',domain:'framework',name:'FastAPI',version:'0.111',paradigm:['api','async','typed'],tags:['python','api','openapi','async'],desc:'Modern async Python API. Auto OpenAPI/Swagger, Pydantic validation, OAuth2.',snippet:'@app.post("/items/", response_model=Item)\nasync def create_item(item: Item): return item',bridges:['python.pydantic','python.asyncio','python.sqlalchemy','framework.fastapi']},
  {id:'python.pytest',domain:'library',name:'pytest',version:'8.2',paradigm:['testing','fixture','assertion'],tags:['python','testing','fixture','plugin'],desc:'Powerful test framework. Fixtures, parametrize, markers, plugins (coverage, mock).',snippet:'@pytest.mark.parametrize("n,expected", [(1,1),(2,1),(10,55)])\ndef test_fib(n, expected):\n    assert fib(n) == expected',bridges:['python.builtins']},
  {id:'python.numpy',domain:'library',name:'NumPy',version:'2.0',paradigm:['array','numeric','vectorized'],tags:['python','scientific','array','ml'],desc:'N-dimensional array computing. Broadcasting, ufuncs, FFT, linear algebra.',snippet:'a = np.random.randn(1000, 784)\nb = np.random.randn(784, 128)\nc = a @ b',bridges:['python.scipy','python.pandas','lib.pytorch']},
  {id:'python.requests',domain:'library',name:'requests',version:'2.32',paradigm:['http','sync','ergonomic'],tags:['python','http','client','simple'],desc:'Human-friendly HTTP. Session, auth, headers, cookies, redirects.',snippet:'with requests.Session() as s:\n    r = s.get("https://api.example.com/users")\n    r.raise_for_status()\n    print(r.json())',bridges:['python.httpx','python.asyncio']},
  {id:'python.click',domain:'library',name:'Click',version:'8.1',paradigm:['cli','declarative','composable'],tags:['python','cli','command','decorator'],desc:'Composable CLI framework. @click.command, @option, @argument, groups.',snippet:'@click.command()\n@click.argument("name")\ndef greet(name):\n    click.echo(f"Hello {name}!")',bridges:['python.argparse']},

  // ── JavaScript ecosystem ────────────────────────────────────────
  {id:'js.promise',domain:'syntax',name:'Promise / async-await',version:'ES2024',paradigm:['async','functional','concurrent'],tags:['javascript','async','promise','concurrent'],desc:'Promise: .then/.catch/.finally. async/await sugar. Promise.all, allSettled, race.',snippet:'const results = await Promise.allSettled([\n    fetch("/api/users"),\n    fetch("/api/posts"),\n]);',bridges:['js.fetch','syntax.async-await']},
  {id:'js.fetch',domain:'library',name:'Fetch API',version:'Living',paradigm:['http','async','streaming'],tags:['javascript','http','fetch','browser'],desc:'Native browser HTTP. Request/Response/Headers, streaming, AbortController.',snippet:'const res = await fetch("/api/data", {\n    method: "POST",\n    body: JSON.stringify(payload),\n});\nconst data = await res.json();',bridges:['js.promise','proto.http']},
  {id:'js.react',domain:'library',name:'React',version:'19',paradigm:['component','declarative','virtual-dom'],tags:['javascript','ui','react','meta'],desc:'Component-based UI. Hooks (useState, useEffect, useCallback), Server Components.',snippet:'function Counter({ initial = 0 }) {\n    const [count, setCount] = useState(initial);\n    return <button onClick={() => setCount(c=>c+1)}>Count: {count}</button>;\n}',bridges:['lib.react','framework.nextjs']},
  {id:'js.typescript',domain:'lang',name:'TypeScript',version:'5.5',paradigm:['typed','oop','functional'],tags:['javascript','typescript','typed','microsoft'],desc:'Typed superset of JS. Structural typing, generics, conditional types.',snippet:'type DeepReadonly<T> = T extends object\n    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }\n    : T;',bridges:['lang.typescript']},
  {id:'js.zod',domain:'library',name:'Zod',version:'3.23',paradigm:['validation','typed','schema'],tags:['javascript','validation','schema','typescript'],desc:'TypeScript-first schema validation. parse/safeParse, transform, infer.',snippet:'const UserSchema = z.object({\n    id: z.number().int().positive(),\n    email: z.string().email(),\n});\ntype User = z.infer<typeof UserSchema>;',bridges:['js.react']},
  {id:'js.vite',domain:'infra',name:'Vite',version:'5.3',paradigm:['build','bundler','dev-server'],tags:['javascript','build','bundler','dev'],desc:'Next-gen frontend tooling. ES module dev server, instant HMR, Rollup build.',snippet:'export default defineConfig({\n    plugins: [react()],\n    build: { target: "esnext" },\n});',bridges:['js.modules']},
  {id:'js.playwright',domain:'library',name:'Playwright',version:'1.45',paradigm:['e2e','browser-automation','testing'],tags:['javascript','testing','e2e','browser'],desc:'Cross-browser E2E testing. Auto-wait, network interception, tracing, codegen.',snippet:'test("login flow", async ({ page }) => {\n    await page.goto("/login");\n    await page.fill("[name=email]", "user@example.com");\n    await expect(page).toHaveURL("/dashboard");\n});',bridges:['js.vitest']},

  // ── HTML/CSS ────────────────────────────────────────────────────
  {id:'html.semantics',domain:'syntax',name:'HTML Semantic Elements',version:'HTML5',paradigm:['declarative','semantic','accessibility'],tags:['html','semantic','accessibility','seo'],desc:'<header>, <nav>, <main>, <article>, <section>, <aside>, <footer>, <time>, <mark>.',snippet:'<main>\n    <article>\n        <header><h1>Title</h1><time datetime="2024-06-15">June 15</time></header>\n        <section><p>Body…</p></section>\n    </article>\n</main>',bridges:['html.aria','html.forms']},
  {id:'html.css-grid',domain:'syntax',name:'CSS Grid',version:'CSS4',paradigm:['layout','declarative','2d-grid'],tags:['html','css','grid','layout'],desc:'2D layout system. grid-template-columns, fr, auto-fill/fit, named areas, subgrid.',snippet:'.grid {\n    display: grid;\n    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));\n    gap: 1.5rem;\n}',bridges:['html.css-flex']},
  {id:'html.css-flex',domain:'syntax',name:'CSS Flexbox',version:'CSS4',paradigm:['layout','declarative','1d-axis'],tags:['html','css','flexbox','layout'],desc:'1D layout. justify-content, align-items, flex-grow/shrink/basis, gap.',snippet:'.nav {\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    gap: 1rem;\n}',bridges:['html.css-grid']},
  {id:'html.web-components',domain:'library',name:'Web Components',version:'Living',paradigm:['component','custom-element','shadow-dom'],tags:['html','web-components','custom-elements','shadow-dom'],desc:'Custom Elements + Shadow DOM + HTML Templates. Reusable, encapsulated elements.',snippet:'class UserCard extends HTMLElement {\n    connectedCallback() {\n        const shadow = this.attachShadow({ mode: "open" });\n        shadow.innerHTML = `<p>${this.getAttribute("name")}</p>`;\n    }\n}\ncustomElements.define("user-card", UserCard);',bridges:['html.semantics']},
  {id:'html.svg',domain:'syntax',name:'SVG',version:'SVG 2',paradigm:['vector','declarative','2d'],tags:['html','svg','vector','graphics'],desc:'Scalable Vector Graphics. Inline SVG, paths, defs/use, clip-path, filter.',snippet:'<svg viewBox="0 0 100 100">\n    <circle cx="50" cy="50" r="40" fill="none" stroke="#00d4ff" stroke-width="2"/>\n    <text x="50" y="55" text-anchor="middle">UCE</text>\n</svg>',bridges:['html.semantics']},

  // ── Node.js ecosystem ───────────────────────────────────────────
  {id:'node.core',domain:'lang',name:'Node.js Runtime',version:'22 LTS',paradigm:['event-loop','async','server'],tags:['node','runtime','server','javascript'],desc:'V8-powered JS runtime. libuv event loop, non-blocking I/O, ESM + CJS modules.',snippet:'process.on("uncaughtException", err => { console.error(err); process.exit(1); });\nprocess.on("SIGTERM", () => gracefulShutdown());',bridges:['node.http','node.fs','node.streams']},
  {id:'node.express',domain:'framework',name:'Express.js',version:'4.19',paradigm:['web','middleware','routing'],tags:['node','web','express','middleware'],desc:'Minimal web framework. Router, middleware chain, req/res/next, error handlers.',snippet:'app.get("/users/:id", async (req, res, next) => {\n    try {\n        const user = await db.users.findById(req.params.id);\n        res.json(user);\n    } catch (err) { next(err); }\n});',bridges:['node.http','node.fastify']},
  {id:'node.fastify',domain:'framework',name:'Fastify',version:'4.28',paradigm:['web','schema','performance'],tags:['node','web','fastify','schema'],desc:'High-performance framework. JSON Schema validation, plugin system, lifecycle hooks.',snippet:'app.post("/users", {\n    schema: { body: { type: "object", required: ["name"] } },\n    handler: async (req, reply) => reply.code(201).send(await db.insert(req.body))\n});',bridges:['node.http','node.express']},
  {id:'node.prisma',domain:'library',name:'Prisma',version:'5.16',paradigm:['orm','typed','migration'],tags:['node','orm','database','typescript'],desc:'Next-gen TypeScript ORM. Schema-first, auto-generated client, migrations.',snippet:'const users = await prisma.user.findMany({\n    where: { posts: { some: { published: true } } },\n    include: { posts: true },\n});',bridges:['node.core','infra.postgresql']},
  {id:'node.socket-io',domain:'library',name:'Socket.IO',version:'4.7',paradigm:['real-time','websocket','rooms'],tags:['node','websocket','real-time','rooms'],desc:'WebSocket abstraction with rooms, namespaces, auto-reconnect, acknowledgements.',snippet:'io.on("connection", socket => {\n    socket.join(`room:${socket.handshake.auth.roomId}`);\n    socket.on("message", data => io.to(`room:${data.roomId}`).emit("message", data));\n});',bridges:['node.http','proto.websocket']},
  {id:'node.jest',domain:'library',name:'Jest',version:'29.7',paradigm:['testing','unit','mock'],tags:['node','testing','jest','mock'],desc:'All-in-one testing framework. Snapshot testing, module mocking, fake timers.',snippet:'it("creates a user", async () => {\n    db.insert.mockResolvedValue({ id: 1 });\n    const user = await UserService.create({ name: "James" });\n    expect(user.id).toBe(1);\n});',bridges:['js.playwright']},
  {id:'node.zod',domain:'library',name:'Zod (Node)',version:'3.23',paradigm:['validation','typed','schema'],tags:['node','validation','schema','typescript'],desc:'Runtime schema validation. Validate env vars, request bodies, config files.',snippet:'const Env = z.object({\n    DATABASE_URL: z.string().url(),\n    PORT: z.coerce.number().int().default(3000),\n});\nexport const env = Env.parse(process.env);',bridges:['js.zod','node.core']},
];

// ── Derive UUIDs + build index ────────────────────────────────────
const UCE_DB = UCE_RAW.map(e => ({...e, uuid: uceUUID(e.id)}));
const UCE_BY_ID = Object.fromEntries(UCE_DB.map(e => [e.id, e]));

// ── State ─────────────────────────────────────────────────────────
let _uceDomain = 'all';
let _uceSelected = null;
let _uceHighlighted = new Set(); // IDs matched in current file

// ── Escape HTML ───────────────────────────────────────────────────
function _uceE(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// ── Render domain filter bar ──────────────────────────────────────
function _uceRenderDomainBar(){
  const bar = document.getElementById('uce-domain-bar');
  if(!bar) return;
  const counts = {};
  UCE_DB.forEach(e => { counts[e.domain] = (counts[e.domain]||0)+1; });
  const all = UCE_DB.length;
  bar.innerHTML = '';
  const mkBtn = (domain, label, count) => {
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.style.cssText = `font-size:9px;padding:2px 8px;white-space:nowrap;flex-shrink:0;${domain===_uceDomain?'border-color:var(--c);color:var(--c);':''}`;
    btn.textContent = `${label} ${count}`;
    btn.onclick = () => { _uceDomain = domain; _uceSelected = null; uceRender(); };
    bar.appendChild(btn);
  };
  mkBtn('all', 'ALL', all);
  Object.entries(UCE_DOMAINS).forEach(([k,v]) => {
    if(counts[k]) mkBtn(k, v.label.toUpperCase(), counts[k]);
  });
}

// ── Render card grid ──────────────────────────────────────────────
function _uceRenderGrid(entries){
  const grid = document.getElementById('uce-grid');
  if(!grid) return;
  grid.innerHTML = '';
  if(!entries.length){
    grid.innerHTML = '<div style="grid-column:1/-1;padding:20px;font-size:10px;color:var(--text3);font-family:var(--mono)">No entries match.</div>';
    return;
  }
  entries.forEach(e => {
    const highlighted = _uceHighlighted.has(e.id);
    const card = document.createElement('div');
    card.style.cssText = `background:${UCE_COLORS[e.domain]||'var(--bg2)'};border:0.5px solid ${UCE_BORDER[e.domain]||'var(--border)'};border-radius:3px;padding:10px;cursor:pointer;transition:border-color .12s;position:relative;${highlighted?'box-shadow:0 0 0 1px var(--c);':''}`;
    card.innerHTML = `
      ${highlighted ? '<div style="position:absolute;top:6px;right:6px;width:6px;height:6px;border-radius:50%;background:var(--c);"></div>' : ''}
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:6px;margin-bottom:6px;">
        <span style="font-size:12px;font-weight:600;color:var(--text);font-family:var(--mono)">${_uceE(e.name)}</span>
        <span style="font-size:8px;font-weight:600;padding:1px 5px;border-radius:2px;background:${UCE_COLORS[e.domain]};color:${UCE_TEXT[e.domain]||'var(--c)'};border:0.5px solid ${UCE_BORDER[e.domain]};white-space:nowrap;flex-shrink:0">${(UCE_DOMAINS[e.domain]?.label||e.domain).toUpperCase()}</span>
      </div>
      <div style="font-family:var(--mono);font-size:8px;color:var(--text4);margin-bottom:5px;word-break:break-all;">${e.uuid.substring(0,18)}…</div>
      <div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:6px;">${(e.tags||[]).slice(0,4).map(t=>`<span style="font-size:8px;padding:1px 5px;border-radius:2px;background:var(--bg2);color:var(--text3);border:0.5px solid var(--border)">${t}</span>`).join('')}${e.version?`<span style="font-size:8px;padding:1px 5px;border-radius:2px;background:var(--bg2);color:var(--text4);border:0.5px solid var(--border)">${_uceE(e.version)}</span>`:''}</div>
      <div style="font-size:10px;color:var(--text2);line-height:1.5;">${_uceE((e.desc||'').substring(0,90))}${(e.desc||'').length>90?'…':''}</div>
      ${e.bridges?.length ? `<div style="margin-top:6px;display:flex;flex-wrap:wrap;gap:3px;">${e.bridges.slice(0,4).map(b=>`<span style="font-size:8px;padding:1px 5px;border-radius:2px;background:var(--bg1);color:var(--text3);border:0.5px solid var(--border);font-family:var(--mono);cursor:pointer" onclick="event.stopPropagation();uceOpenById('${b}')">${b.split('.').pop()}</span>`).join('')}</div>` : ''}
    `;
    card.onclick = () => uceOpenEntry(e);
    grid.appendChild(card);
  });
}

// ── Render detail panel ───────────────────────────────────────────
function uceOpenEntry(e){
  _uceSelected = e.id;
  const detail = document.getElementById('uce-detail');
  if(!detail) return;
  const bridges = (e.bridges||[]).map(b => {
    const t = UCE_BY_ID[b];
    return `<div style="display:flex;align-items:center;gap:8px;padding:4px 8px;background:var(--bg2);border-radius:2px;cursor:pointer;margin-bottom:3px;font-size:10px;" onclick="uceOpenById('${b}')">
      <span style="font-size:8px;padding:1px 4px;border-radius:2px;background:${UCE_COLORS[t?.domain||'lang']};color:${UCE_TEXT[t?.domain||'lang']};border:0.5px solid ${UCE_BORDER[t?.domain||'lang']}">${t?.domain||'?'}</span>
      <span style="font-family:var(--mono);color:var(--text2);flex:1">${b}</span>
      ${t?`<span style="color:var(--text);font-weight:600">${t.name}</span>`:'<span style="color:var(--text3)">extended</span>'}
    </div>`;
  }).join('');
  detail.style.display = 'flex';
  detail.style.flexDirection = 'column';
  detail.innerHTML = `
    <div style="flex-shrink:0;display:flex;align-items:center;gap:8px;padding:0 0 10px;">
      <button onclick="uceCloseDetail()" style="background:none;border:none;color:var(--text3);font-size:16px;cursor:pointer;padding:0;line-height:1;">×</button>
      <span style="font-size:8px;padding:1px 5px;border-radius:2px;background:${UCE_COLORS[e.domain]};color:${UCE_TEXT[e.domain]};border:0.5px solid ${UCE_BORDER[e.domain]}">${(UCE_DOMAINS[e.domain]?.label||e.domain).toUpperCase()}</span>
      <span style="font-size:16px;font-weight:600;color:var(--text)">${_uceE(e.name)}</span>
      ${e.version?`<span style="font-size:9px;color:var(--text3)">${_uceE(e.version)}</span>`:''}
    </div>
    <div style="font-family:var(--mono);font-size:9px;color:var(--c);padding:5px 8px;background:rgba(0,212,255,.05);border:0.5px solid rgba(0,212,255,.15);border-radius:2px;word-break:break-all;margin-bottom:10px;">${e.uuid}</div>
    ${e.desc?`<div style="font-size:11px;color:var(--text2);line-height:1.6;margin-bottom:10px;">${_uceE(e.desc)}</div>`:''}
    ${e.snippet?`<div style="font-size:9px;color:var(--text3);letter-spacing:.1em;text-transform:uppercase;margin-bottom:4px;">Example</div><pre style="background:var(--bg2);border:0.5px solid var(--border);border-radius:2px;padding:8px 10px;font-family:var(--mono);font-size:9px;color:var(--text);line-height:1.6;overflow-x:auto;white-space:pre;">${_uceE(e.snippet)}</pre>`:''}
    ${e.paradigm?.length?`<div style="margin-top:8px;"><div style="font-size:9px;color:var(--text3);letter-spacing:.1em;text-transform:uppercase;margin-bottom:4px;">Paradigm</div><div style="display:flex;flex-wrap:wrap;gap:3px;">${e.paradigm.map(p=>`<span style="font-size:9px;padding:1px 6px;border-radius:2px;background:var(--bg2);color:var(--text2);border:0.5px solid var(--border)">${p}</span>`).join('')}</div></div>`:''}
    ${bridges?`<div style="margin-top:10px;"><div style="font-size:9px;color:var(--text3);letter-spacing:.1em;text-transform:uppercase;margin-bottom:5px;">Cross-references</div>${bridges}</div>`:''}
    <div style="margin-top:10px;padding-top:10px;border-top:0.5px solid var(--border);">
      <div style="font-size:9px;color:var(--text3);letter-spacing:.1em;text-transform:uppercase;margin-bottom:4px;">Metadata</div>
      <table style="font-size:9px;font-family:var(--mono);border-collapse:collapse;width:100%;">
        <tr><td style="color:var(--text3);padding:2px 6px 2px 0;white-space:nowrap;width:35%">id</td><td style="color:var(--text2)">${e.id}</td></tr>
        ${e.typing?`<tr><td style="color:var(--text3);padding:2px 6px 2px 0">typing</td><td style="color:var(--text2)">${e.typing}</td></tr>`:''}
        ${e.compiled!=null?`<tr><td style="color:var(--text3);padding:2px 6px 2px 0">compiled</td><td style="color:var(--text2)">${e.compiled}</td></tr>`:''}
        ${e.gc!=null?`<tr><td style="color:var(--text3);padding:2px 6px 2px 0">gc</td><td style="color:var(--text2)">${e.gc}</td></tr>`:''}
      </table>
    </div>
  `;
}

function uceCloseDetail(){
  _uceSelected = null;
  const d = document.getElementById('uce-detail');
  if(d) d.style.display = 'none';
}

function uceOpenById(id){
  const e = UCE_BY_ID[id];
  if(e) uceOpenEntry(e); else { _uceDomain = 'all'; uceRender(); }
}

// ── Search ────────────────────────────────────────────────────────
function uceSearch(q){
  const res = document.getElementById('uce-search-results');
  if(!q.trim()){ if(res) res.style.display='none'; return; }
  const matches = UCE_DB.filter(e =>
    e.name.toLowerCase().includes(q.toLowerCase()) ||
    e.id.toLowerCase().includes(q.toLowerCase()) ||
    e.uuid.includes(q) ||
    (e.tags||[]).some(t => t.includes(q.toLowerCase())) ||
    (e.desc||'').toLowerCase().includes(q.toLowerCase())
  ).slice(0,8);
  if(!res) return;
  if(!matches.length){ res.style.display='none'; return; }
  res.style.display='block';
  res.innerHTML = matches.map(e => `
    <div onclick="uceOpenEntry(UCE_BY_ID['${e.id}']);document.getElementById('uce-search').value='';document.getElementById('uce-search-results').style.display='none';"
      style="padding:6px 10px;cursor:pointer;border-bottom:0.5px solid var(--border);font-size:11px;display:flex;gap:8px;align-items:center;">
      <span style="font-size:8px;padding:1px 4px;border-radius:2px;background:${UCE_COLORS[e.domain]};color:${UCE_TEXT[e.domain]};border:0.5px solid ${UCE_BORDER[e.domain]}">${e.domain}</span>
      <span style="font-weight:600;color:var(--text)">${_uceE(e.name)}</span>
      <span style="font-family:var(--mono);font-size:8px;color:var(--text3);margin-left:auto">${e.uuid.substring(0,8)}…</span>
    </div>
  `).join('');
}

// ── Scan active forge file for UCE matches ────────────────────────
function uceScanFile(){
  const editor = document.getElementById('forge-editor');
  if(!editor || !editor.value.trim()){ _uceHighlighted.clear(); _uceUpdateStatus(); return; }
  const code = editor.value;
  _uceHighlighted.clear();
  UCE_DB.forEach(e => {
    const tokens = [
      e.id.split('.').pop(),       // slug: 'python', 'react', 'asyncio'
      e.name,                       // display name
      ...(e.tags||[]),             // tags
      ...(e.paradigm||[]),         // paradigms
    ].filter(Boolean);
    const matched = tokens.some(tok => {
      if(tok.length < 3) return false;
      try { return new RegExp(`\\b${tok.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\b`,'i').test(code); }
      catch { return false; }
    });
    if(matched) _uceHighlighted.add(e.id);
  });
  uceRender();
}

// ── Status bar ────────────────────────────────────────────────────
function _uceUpdateStatus(){
  const st = document.getElementById('uce-status');
  const ct = document.getElementById('uce-count-badge');
  if(!st) return;
  const total = UCE_DB.length;
  const shown = _uceDomain==='all' ? total : UCE_DB.filter(e=>e.domain===_uceDomain).length;
  const hits = _uceHighlighted.size;
  st.innerHTML = `<span>${total} entries</span><span>${shown} shown</span>${hits?`<span style="color:var(--c)">⟁ ${hits} in file</span>`:''}`;
  if(ct) ct.textContent = `${total.toLocaleString()} entries`;
}

// ── Main render ───────────────────────────────────────────────────
function uceRender(){
  _uceRenderDomainBar();
  let entries = _uceDomain==='all' ? UCE_DB : UCE_DB.filter(e=>e.domain===_uceDomain);
  // Sort: file matches first
  if(_uceHighlighted.size > 0){
    entries = [
      ...entries.filter(e => _uceHighlighted.has(e.id)),
      ...entries.filter(e => !_uceHighlighted.has(e.id)),
    ];
  }
  _uceRenderGrid(entries);
  _uceUpdateStatus();
  if(_uceSelected && UCE_BY_ID[_uceSelected]) uceOpenEntry(UCE_BY_ID[_uceSelected]);
  // Close search dropdown on outside click
  setTimeout(()=>{
    document.addEventListener('click', e=>{
      if(!e.target.closest('#uce-search') && !e.target.closest('#uce-search-results')){
        const r = document.getElementById('uce-search-results');
        if(r) r.style.display='none';
      }
    }, {once:true});
  }, 0);
}

// ── Wire forge editor → auto-scan on file switch ──────────────────
(function patchForgeForUCE(){
  const _origOpen = window.forgeOpenContent;
  if(typeof _origOpen === 'function'){
    window.forgeOpenContent = function(id, name, content){
      _origOpen.apply(this, arguments);
      if(document.getElementById('fp-panel-uce')?.style.display !== 'none'){
        setTimeout(uceScanFile, 100);
      }
    };
  }
})();

// Expose globally for onclick handlers
window.uceRender = uceRender;
window.uceSearch = uceSearch;
window.uceScanFile = uceScanFile;
window.uceOpenEntry = uceOpenEntry;
window.uceOpenById = uceOpenById;
window.uceCloseDetail = uceCloseDetail;
window.UCE_BY_ID = UCE_BY_ID;
window.UCE_DB = UCE_DB;

})();
