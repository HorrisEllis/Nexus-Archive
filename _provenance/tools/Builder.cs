using System;
using System.IO;
using System.IO.Compression;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Security.Cryptography;
using System.Diagnostics;

public class Snap {
    public int seq; public string name; public List<string> dupes = new List<string>(); public string sha256; public long size;
    public string mtime; public string contentDate; public string key;
    public string kind; public string root; public int files; public long bytes;
    public string verInternal; public string verName; public string version;
    public int added, modified, deleted; public Dictionary<string, int> systems = new Dictionary<string, int>(); public List<string> sample = new List<string>();
    public string gitHead; public int nmFiles; public int gitFiles; public List<string> large = new List<string>();
    public List<string> redactions = new List<string>(); public List<string> badPaths = new List<string>();
    public string title; public string quote;
    public List<string[]> decisions = new List<string[]>(); public List<string[]> ideas = new List<string[]>();
    public List<string[]> docsAdded = new List<string[]>(); public List<string> docsRemoved = new List<string>();
    public string identicalTo; public string newName; public List<string> dupeNewNames = new List<string>(); public int mark; public string branch;
    public string error;
}

public static class Builder {
    static readonly Regex RxSecret = new Regex(
        @"(?<![A-Za-z0-9])sk-[A-Za-z0-9_\-]{20,}|(?<![A-Za-z0-9_])gh[pousr]_[A-Za-z0-9]{36,}|(?<![A-Za-z0-9_])github_pat_[A-Za-z0-9_]{40,}|(?<![A-Z0-9])AKIA[0-9A-Z]{16}(?![A-Z0-9])|(?<![A-Za-z0-9])AIza[0-9A-Za-z_\-]{35}|(?<![A-Za-z0-9])xox[baprs]-[A-Za-z0-9\-]{10,}|(?<![A-Za-z0-9_])hf_[A-Za-z0-9]{30,}|(?<![A-Za-z0-9_])gsk_[A-Za-z0-9]{40,}|-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----",
        RegexOptions.Compiled);
    static readonly Regex RxVerName = new Regex(@"(?<!\d)(\d+)[._](\d+)[._](\d+)(?!\d)", RegexOptions.Compiled);
    static readonly Regex RxSystem = new Regex(@"system:\s*['""]([^'""]+)['""]", RegexOptions.Compiled);
    static readonly Regex RxPkgVer = new Regex(@"""version""\s*:\s*""([^""]+)""", RegexOptions.Compiled);
    static readonly Regex RxDecName = new Regex(@"(?i)decision|(^|[-_ ])adr[-_ ]|rationale|trade-?off", RegexOptions.Compiled);
    static readonly Regex RxIdeaName = new Regex(@"(?i)roadmap|backlog|todo|proposal|wishlist|brainstorm|vision|future|open[-_ ]questions|(^|[-_ ])ideas?([-_ .]|$)", RegexOptions.Compiled);
    static readonly Regex RxLogName = new Regex(@"(?i)^(changelog|changes|handoff|release|session)|handoff|session-notes", RegexOptions.Compiled);
    static readonly Regex RxDecHead = new Regex(@"(?i)\b(decision|decisions|decided|rationale|why|chose|choice|trade-?offs?)\b", RegexOptions.Compiled);
    static readonly Regex RxIdeaHead = new Regex(@"(?i)\b(ideas?|next|deferred|future|later|not built|not done|open questions?|todo|backlog|proposed|parked|follow-?ups?|remaining)\b", RegexOptions.Compiled);
    static readonly Regex RxHeading = new Regex(@"^#{1,4}\s+(.*)$", RegexOptions.Compiled);

    static Stream gitIn; static int markCounter = 0;
    static Dictionary<string, int> blobMarks = new Dictionary<string, int>();
    static TextWriter log;

    static void W(string s) { var b = Encoding.UTF8.GetBytes(s); gitIn.Write(b, 0, b.Length); }
    static string QuotePath(string p) {
        bool need = p.StartsWith("\"") || p.Any(c => c < 0x20 || c == 0x7f);
        if (!need) return p;
        var sb = new StringBuilder("\"");
        foreach (var b in Encoding.UTF8.GetBytes(p)) {
            if (b == '"') sb.Append("\\\""); else if (b == '\\') sb.Append("\\\\"); else if (b == '\n') sb.Append("\\n");
            else if (b < 0x20 || b >= 0x7f) sb.Append("\\" + Convert.ToString(b, 8).PadLeft(3, '0')); else sb.Append((char)b);
        }
        // non-ascii bytes were appended as chars 0x80-0xff; re-encode latin1 on write is wrong, so fall back to octal for them
        return sb.Append("\"").ToString();
    }
    static string GitSha(byte[] d) {
        using (var h = IncrementalHash.CreateHash(HashAlgorithmName.SHA1)) {
            h.AppendData(Encoding.ASCII.GetBytes("blob " + d.Length + "\0")); h.AppendData(d);
            return Convert.ToHexString(h.GetHashAndReset());
        }
    }
    static byte[] ReadAll(ZipArchiveEntry e) {
        using (var s = e.Open()) using (var ms = new MemoryStream((int)Math.Min(e.Length, int.MaxValue))) { s.CopyTo(ms); return ms.ToArray(); }
    }
    static string Txt(byte[] d) { return Encoding.UTF8.GetString(d); }
    static string Slug(string s) { s = Regex.Replace(s, @"[^A-Za-z0-9.+]+", "-").Trim('-', '.'); return s; }

    static bool LooksText(byte[] d) { int n = Math.Min(d.Length, 8192); for (int i = 0; i < n; i++) if (d[i] == 0) return false; return true; }

    static byte[] Redact(byte[] d, string path, Snap s) {
        if (d.Length > 8 * 1024 * 1024 || d.Length < 20 || !LooksText(d)) return d;
        string t = Encoding.Latin1.GetString(d);
        if (!RxSecret.IsMatch(t)) return d;
        int n = 0; var kinds = new SortedSet<string>();
        string r = RxSecret.Replace(t, m => {
            n++; string v = m.Value; string kind = v.StartsWith("-----") ? "private-key" : v.StartsWith("sk-") ? "sk-key" : v.StartsWith("gh") ? "github-token" : v.StartsWith("AKIA") ? "aws-key" : v.StartsWith("AIza") ? "google-key" : v.StartsWith("xox") ? "slack-token" : v.StartsWith("hf_") ? "hf-token" : "gsk-key";
            kinds.Add(kind);
            string fp = Convert.ToHexString(SHA256.HashData(Encoding.Latin1.GetBytes(v))).Substring(0, 8).ToLower();
            return "[REDACTED:" + kind + ":" + fp + "]";
        });
        s.redactions.Add(path + " (" + n + " x " + string.Join(",", kinds) + ")");
        return Encoding.Latin1.GetBytes(r);
    }

    class Ent { public ZipArchiveEntry e; public string raw; }

    static void Harvest(string path, byte[] d, Snap s, bool isLog, bool isDec, bool isIdea) {
        string t = Txt(d); var lines = t.Replace("\r", "").Split('\n');
        string title = lines.Select(l => l.Trim()).FirstOrDefault(l => l.Length > 0) ?? ""; title = title.TrimStart('#', ' ');
        if (title.Length > 160) title = title.Substring(0, 160);
        if (isDec) s.docsAdded.Add(new[] { "decision", path, title });
        else if (isIdea) s.docsAdded.Add(new[] { "idea", path, title });
        if (!(isLog || isDec || isIdea)) return;
        for (int i = 0; i < lines.Length; i++) {
            var m = RxHeading.Match(lines[i]); if (!m.Success) continue;
            string h = m.Groups[1].Value.Trim();
            bool dec = RxDecHead.IsMatch(h), idea = !dec && RxIdeaHead.IsMatch(h);
            if (!dec && !idea) continue;
            var sb = new StringBuilder();
            for (int j = i + 1; j < lines.Length && !RxHeading.IsMatch(lines[j]); j++) { if (sb.Length > 700) break; sb.Append(lines[j]).Append('\n'); }
            string body = sb.ToString().Trim(); if (body.Length < 15) continue; if (body.Length > 700) body = body.Substring(0, 700) + " …";
            if (dec && s.decisions.Count < 10) s.decisions.Add(new[] { path, h, body });
            if (idea && s.ideas.Count < 10) s.ideas.Add(new[] { path, h, body });
        }
    }

    public static void Run(string src, string invPath, string outDir, string repo, bool dry, string authorName, string authorEmail) {
        log = new StreamWriter(Path.Combine(outDir, dry ? "dryrun.log" : "build.log"), false, new UTF8Encoding(false));
        var inv = JsonDocument.Parse(File.ReadAllText(invPath)).RootElement;
        var groups = new Dictionary<string, Snap>(); var others = new List<Snap>();
        foreach (var r in inv.EnumerateArray()) {
            string name = r.GetProperty("name").GetString(); string sha = r.GetProperty("sha256").GetString();
            string mt = r.GetProperty("mtime").GetString(); long size = r.GetProperty("size").GetInt64();
            if (!name.ToLower().EndsWith(".zip")) { others.Add(new Snap { name = name, sha256 = sha, mtime = mt, size = size, kind = "non-archive" }); continue; }
            Snap g;
            if (!groups.TryGetValue(sha, out g)) { g = new Snap { name = name, sha256 = sha, mtime = mt, size = size }; groups[sha] = g; g.dupes.Add(name);
                JsonElement nw; if (r.TryGetProperty("newest", out nw) && nw.ValueKind == JsonValueKind.String) g.contentDate = nw.GetString(); }
            else { g.dupes.Add(name); if (string.CompareOrdinal(mt, g.mtime) < 0) { g.mtime = mt; g.name = name; } }
        }
        foreach (var g in groups.Values) {
            g.dupes.Remove(g.name); g.dupes.Sort(StringComparer.OrdinalIgnoreCase);
            DateTime mt = DateTime.Parse(g.mtime); DateTime k = mt;
            if (g.contentDate != null) { DateTime c = DateTime.Parse(g.contentDate); if (c > mt.AddHours(1)) c = c.AddHours(-7); if (c > mt) c = mt; g.contentDate = c.ToString("s"); k = c; }
            g.key = k.ToString("s");
        }
        var snaps = groups.Values.OrderBy(g => g.key, StringComparer.Ordinal).ThenBy(g => g.mtime, StringComparer.Ordinal).ThenBy(g => g.name, StringComparer.OrdinalIgnoreCase).ToList();
        for (int i = 0; i < snaps.Count; i++) snaps[i].seq = i + 1;

        Process git = null;
        if (!dry) {
            var psi = new ProcessStartInfo("git", "fast-import --quiet --date-format=raw --export-marks=\"" + Path.Combine(outDir, "marks.txt") + "\"") { WorkingDirectory = repo, RedirectStandardInput = true, UseShellExecute = false };
            git = Process.Start(psi); gitIn = new BufferedStream(git.StandardInput.BaseStream, 1 << 20);
        }
        var P = new Dictionary<string, string>(StringComparer.Ordinal);   // main tree: path -> id (blob sha, or crc|size in dry mode)
        int mainTip = 0, artTip = 0; int tipSeq = 0;
        var sw = Stopwatch.StartNew();

        foreach (var s in snaps) {
            try {
                using (var z = ZipFile.OpenRead(Path.Combine(src, s.name))) {
                    var ents = new List<Ent>(); var gitFiles = new Dictionary<string, ZipArchiveEntry>();
                    foreach (var e in z.Entries) {
                        string p = e.FullName.Replace('\\', '/');
                        if (p.EndsWith("/") || p.Length == 0) continue;
                        var segs = p.Split('/');
                        if (segs.Contains("node_modules")) { s.nmFiles++; continue; }
                        int gi = Array.IndexOf(segs, ".git");
                        if (gi >= 0) { s.gitFiles++; string rel = string.Join("/", segs.Skip(gi + 1)); if (rel == "HEAD" || rel == "packed-refs" || rel.StartsWith("refs/heads/")) { if (!gitFiles.ContainsKey(rel)) gitFiles[rel] = e; } continue; }
                        if (segs.Contains("__MACOSX") || segs[segs.Length - 1] == ".DS_Store") continue;
                        if (segs.Any(x => x.Length == 0 || x == "." || x == "..")) { s.badPaths.Add(p); continue; }
                        ents.Add(new Ent { e = e, raw = p });
                    }
                    // embedded git head
                    if (gitFiles.ContainsKey("HEAD")) {
                        string head = Txt(ReadAll(gitFiles["HEAD"])).Trim(); string sha = head;
                        if (head.StartsWith("ref: ")) { string rf = head.Substring(5).Trim(); string key = rf.StartsWith("refs/heads/") ? rf : null; sha = null;
                            if (key != null && gitFiles.ContainsKey(key)) sha = Txt(ReadAll(gitFiles[key])).Trim();
                            else if (gitFiles.ContainsKey("packed-refs")) { foreach (var l in Txt(ReadAll(gitFiles["packed-refs"])).Split('\n')) if (l.Trim().EndsWith(" " + rf)) sha = l.Trim().Split(' ')[0]; }
                            s.gitHead = (sha ?? "?") + " (" + rf.Replace("refs/heads/", "") + ")"; }
                        else s.gitHead = sha;
                    }
                    s.files = ents.Count; s.bytes = ents.Sum(x => x.e.Length);
                    var mv = RxVerName.Match(Path.GetFileNameWithoutExtension(s.name)); if (mv.Success) s.verName = mv.Groups[1].Value + "." + mv.Groups[2].Value + "." + mv.Groups[3].Value;
                    if (ents.Count == 0) { s.kind = s.gitFiles > 0 ? "git-only" : "empty"; s.version = s.verName; Finish(s, sw); continue; }

                    // root = common directory prefix
                    string[] pre = ents[0].raw.Split('/'); int plen = pre.Length - 1;
                    foreach (var x in ents) { var sg = x.raw.Split('/'); int m = Math.Min(plen, sg.Length - 1); int i = 0; while (i < m && sg[i] == pre[i]) i++; plen = i; if (plen == 0) break; }
                    string cpre = plen == 0 ? "" : string.Join("/", pre.Take(plen)) + "/"; string root = cpre;
                    var rawSet = new HashSet<string>(ents.Select(x => x.raw));
                    if (!rawSet.Contains(cpre + "package.json") && !rawSet.Contains(cpre + "lib/version.js")) {
                        var best = ents.Select(x => x.raw.Substring(cpre.Length)).Where(r => r.Contains("/")).GroupBy(r => r.Substring(0, r.IndexOf('/')))
                            .Where(gp => rawSet.Contains(cpre + gp.Key + "/package.json") || rawSet.Contains(cpre + gp.Key + "/lib/version.js")).OrderByDescending(gp => gp.Count()).FirstOrDefault();
                        if (best != null && best.Count() >= 0.5 * ents.Count) root = cpre + best.Key + "/";
                    }
                    s.root = root;
                    Func<string, string> rooted = raw => raw.StartsWith(root) ? raw.Substring(root.Length) : raw.Substring(cpre.Length);

                    // internal version
                    Func<string, string> readRooted = rel => { var en = ents.FirstOrDefault(x => x.raw == root + rel); return en == null || en.e.Length > 4000000 ? null : Txt(ReadAll(en.e)); };
                    string vj = readRooted("lib/version.js"); if (vj != null) { var m = RxSystem.Match(vj); if (m.Success) s.verInternal = m.Groups[1].Value.Trim(); }
                    if (s.verInternal == null) { string vf = readRooted("VERSION"); if (vf != null && vf.Trim().Length > 0 && vf.Trim().Length < 40) s.verInternal = vf.Trim(); }
                    if (s.verInternal == null) { string pj = readRooted("package.json");
                        if (pj == null) { var en = ents.Where(x => x.raw.EndsWith("/package.json") || x.raw == "package.json").OrderBy(x => x.raw.Count(c => c == '/')).ThenByDescending(x => x.e.Length).FirstOrDefault(); if (en != null && en.raw.Count(c => c == '/') <= 2 && en.e.Length < 4000000) pj = Txt(ReadAll(en.e)); }
                        if (pj != null) { var m = RxPkgVer.Match(pj); if (m.Success) s.verInternal = m.Groups[1].Value.Trim(); } }
                    s.version = s.verInternal ?? s.verName;

                    // classify
                    int n = ents.Count; int bestK = -1, bestOv = -1;
                    for (int k = 0; k <= 3; k++) { int ov = 0; foreach (var x in ents) { var sg = x.raw.Split('/'); if (sg.Length <= k) continue; if (P.ContainsKey(string.Join("/", sg.Skip(k)))) ov++; } if (ov > bestOv) { bestOv = ov; bestK = k; } }
                    int rootedOv = ents.Count(x => P.ContainsKey(rooted(x.raw)));
                    string kind;
                    if (P.Count == 0 || n >= 1000) kind = "full";
                    else if (n < 0.6 * P.Count && Math.Max(bestOv, rootedOv) < 0.1 * n) kind = "artifact";
                    else if (n >= 0.3 * P.Count) kind = "full";
                    else if (Math.Max(bestOv, rootedOv) >= 0.5 * n) kind = "overlay";
                    else kind = "artifact";
                    s.kind = kind;
                    if (kind == "overlay" && rootedOv >= bestOv) bestK = -1; // use root strip

                    // names
                    Func<Ent, string> mapPath = x => { if (kind == "full" || kind == "artifact" || bestK < 0) return rooted(x.raw); var sg = x.raw.Split('/'); return sg.Length <= bestK ? null : string.Join("/", sg.Skip(bestK)); };

                    var T = new Dictionary<string, string>(StringComparer.Ordinal);
                    var pending = new List<string[]>(); // path, mark
                    string wantLog = s.version == null ? null : "CHANGELOG-" + s.version + ".md";
                    foreach (var x in ents.OrderBy(q => q.raw, StringComparer.Ordinal)) {
                        string path = mapPath(x); if (path == null) continue;
                        if (x.e.Length >= 50L * 1024 * 1024) { s.large.Add(path + " (" + (x.e.Length / 1048576) + " MB)"); continue; }
                        string bn = path.Substring(path.LastIndexOf('/') + 1);
                        if (dry) { T[path] = x.e.Crc32.ToString("x8") + "|" + x.e.Length; continue; }
                        byte[] d = ReadAll(x.e); string id = GitSha(d);
                        int mk;
                        if (!blobMarks.TryGetValue(id, out mk)) {
                            byte[] rd = Redact(d, path, s);
                            mk = ++markCounter; blobMarks[id] = mk;
                            W("blob\nmark :" + mk + "\ndata " + rd.Length + "\n"); gitIn.Write(rd, 0, rd.Length); W("\n");
                        }
                        T[path] = id; pending.Add(new[] { path, mk.ToString() });
                        string old; bool isNew = !P.TryGetValue(path, out old);
                        string lower = bn.ToLower();
                        if (d.Length < 2000000 && (lower.EndsWith(".md") || lower.EndsWith(".txt"))) {
                            if (wantLog != null && bn == wantLog && s.title == null) { var ls = Txt(d).Replace("\r", "").Split('\n'); s.title = (ls.FirstOrDefault(l => l.Trim().Length > 0) ?? "").TrimStart('#', ' ').Trim();
                                var q = new StringBuilder(); foreach (var l in ls) { if (l.StartsWith(">")) q.Append(l.TrimStart('>', ' ')).Append(' '); else if (q.Length > 0) break; } s.quote = q.ToString().Trim(); if (s.quote.Length > 400) s.quote = s.quote.Substring(0, 400) + " …"; }
                            if (isNew && kind != "artifact") { bool isDec = RxDecName.IsMatch(bn), isIdea = !isDec && RxIdeaName.IsMatch(bn) && !lower.Contains("idearium"), isLog = RxLogName.IsMatch(bn);
                                if (isDec || isIdea || isLog) Harvest(path, d, s, isLog, isDec, isIdea); }
                        }
                    }
                    // diff vs P
                    var changed = new List<string>();
                    if (kind != "artifact") {
                        foreach (var kv in T) { string old; if (!P.TryGetValue(kv.Key, out old)) { s.added++; changed.Add("A " + kv.Key); } else if (old != kv.Value) { s.modified++; changed.Add("M " + kv.Key); } }
                        if (kind == "full") foreach (var kv in P) if (!T.ContainsKey(kv.Key)) { s.deleted++; changed.Add("D " + kv.Key);
                            string bn = kv.Key.Substring(kv.Key.LastIndexOf('/') + 1); if ((RxDecName.IsMatch(bn) || (RxIdeaName.IsMatch(bn) && !bn.ToLower().Contains("idearium"))) && (bn.EndsWith(".md") || bn.EndsWith(".txt"))) s.docsRemoved.Add(kv.Key); }
                        foreach (var c in changed) { string p = c.Substring(2); int ix = p.IndexOf('/'); string sys = ix < 0 ? "(root)" : p.Substring(0, ix); int cur; s.systems.TryGetValue(sys, out cur); s.systems[sys] = cur + 1; }
                        s.sample = changed.Take(40).ToList();
                        if (s.added + s.modified + s.deleted == 0) { s.identicalTo = tipSeq.ToString("0000"); s.kind = "identical"; Finish(s, sw); continue; }
                    }
                    MakeNames(s);
                    if (!dry) {
                        string branch = kind == "artifact" ? "refs/heads/artifacts" : "refs/heads/main"; s.branch = branch.Replace("refs/heads/", "");
                        int cm = ++markCounter; s.mark = cm;
                        DateTime kd = DateTime.Parse(s.key); var off = TimeZoneInfo.Local.GetUtcOffset(kd); long unix = new DateTimeOffset(kd, off).ToUnixTimeSeconds();
                        string tz = (off < TimeSpan.Zero ? "-" : "+") + Math.Abs(off.Hours).ToString("00") + Math.Abs(off.Minutes).ToString("00");
                        string who = authorName + " <" + authorEmail + "> " + unix + " " + tz;
                        var msg = new StringBuilder();
                        msg.Append("snap " + s.seq.ToString("0000") + ": Nexus " + (s.version == null ? "(unversioned)" : "v" + s.version) + (kind == "full" ? "" : " [" + kind + "]") + (string.IsNullOrEmpty(s.title) ? "" : " — " + Trunc(StripVer(s.title, s.version), 90)) + "\n\n");
                        if (!string.IsNullOrEmpty(s.quote)) msg.Append("\"" + s.quote + "\"\n\n");
                        if (kind != "artifact") msg.Append("Changes vs parent: +" + s.added + " added, ~" + s.modified + " modified, -" + s.deleted + " deleted\n");
                        if (s.systems.Count > 0) msg.Append("Systems: " + string.Join(", ", s.systems.OrderByDescending(k => k.Value).Take(12).Select(k => k.Key + " (" + k.Value + ")")) + "\n");
                        msg.Append("\nSnapshot-Seq: " + s.seq.ToString("0000") + "\nSnapshot-Kind: " + kind + "\nSource-Archive: " + s.name + "\nRenamed-To: " + s.newName + "\nSource-SHA256: " + s.sha256 + "\nArchive-Mtime: " + s.mtime + "\nContent-Date: " + s.key + "\n");
                        if (s.verInternal != null) msg.Append("Version-Internal: " + s.verInternal + "\n"); if (s.verName != null) msg.Append("Version-Filename: " + s.verName + "\n");
                        if (s.root != "") msg.Append("Archive-Root: " + s.root + "\n");
                        msg.Append("Files: " + T.Count + "\n");
                        foreach (var dn in s.dupes) msg.Append("Duplicate-Archive: " + dn + "\n");
                        if (s.nmFiles > 0) msg.Append("Excluded-node_modules-Files: " + s.nmFiles + "\n");
                        if (s.gitFiles > 0) msg.Append("Excluded-Embedded-Git: " + s.gitFiles + " files, HEAD " + (s.gitHead ?? "?") + "\n");
                        foreach (var l in s.large) msg.Append("Excluded-Large-File: " + l + "\n");
                        foreach (var l in s.redactions) msg.Append("Redacted: " + l + "\n");
                        byte[] mb = Encoding.UTF8.GetBytes(msg.ToString());
                        W("commit " + branch + "\nmark :" + cm + "\nauthor " + who + "\ncommitter " + who + "\ndata " + mb.Length + "\n"); gitIn.Write(mb, 0, mb.Length); W("\n");
                        int parent = kind == "artifact" ? artTip : mainTip; if (parent != 0) W("from :" + parent + "\n");
                        if (kind == "full") W("deleteall\n");
                        string prefix = kind == "artifact" ? Path.GetFileNameWithoutExtension(s.newName) + "/" : "";
                        foreach (var pm in pending) W("M 100644 :" + pm[1] + " " + QuotePath(prefix + pm[0]) + "\n");
                        W("\n");
                        if (kind == "artifact") artTip = cm; else mainTip = cm;
                    }
                    if (kind == "full") { P = T; tipSeq = s.seq; } else if (kind == "overlay") { foreach (var kv in T) P[kv.Key] = kv.Value; tipSeq = s.seq; }
                }
            } catch (Exception ex) { s.error = ex.GetType().Name + ": " + ex.Message; s.kind = s.kind ?? "error"; }
            Finish(s, sw);
        }
        if (!dry) { W("done\n"); gitIn.Flush(); gitIn.Close(); git.WaitForExit(); log.WriteLine("git fast-import exit " + git.ExitCode); Console.WriteLine("git fast-import exit " + git.ExitCode); }
        foreach (var o in others) { o.newName = o.name; }
        var all = new List<Snap>(snaps); all.AddRange(others);
        File.WriteAllText(Path.Combine(outDir, dry ? "records.dry.json" : "records.json"), JsonSerializer.Serialize(all, new JsonSerializerOptions { IncludeFields = true, WriteIndented = true, Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping }), new UTF8Encoding(false));
        log.Close();
        Console.WriteLine("done " + snaps.Count + " snapshots in " + sw.Elapsed);
    }
    static string Trunc(string s, int n) { return s.Length <= n ? s : s.Substring(0, n) + "…"; }
    static string StripVer(string title, string ver) { if (ver != null && title.StartsWith(ver)) title = title.Substring(ver.Length).TrimStart(' ', '—', '-', ':'); return title; }
    static HashSet<string> usedNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
    static string NewName(Snap s, string orig, int dup) {
        string stem = Path.GetFileNameWithoutExtension(orig);
        string label = Regex.Replace(stem, @"(?i)^nexus", "");
        if (s.version != null) { string vp = Regex.Escape(s.version).Replace(@"\.", "[._]"); label = Regex.Replace(label, @"(?i)v?" + vp + @"(?!\d)", ""); }
        label = Regex.Replace(label, @"20\d\d-\d\d-\d\d", m => m.Value == s.key.Substring(0, 10) ? "" : m.Value);
        label = RxVerName.Replace(label, m => "named-" + m.Groups[1].Value + "." + m.Groups[2].Value + "." + m.Groups[3].Value);
        label = Slug(label).ToLower();
        string ver = s.version == null ? "unversioned" : "v" + Regex.Replace(s.version, @"[^0-9A-Za-z.+\-]", "");
        string b = "nexus-" + s.seq.ToString("0000") + "_" + s.key.Substring(0, 10) + "_" + ver + (label.Length > 0 ? "_" + label : "") + (dup > 0 ? "_dup" + dup : "");
        string n = b + ".zip"; int i = 2; while (!usedNames.Add(n)) { n = b + "_" + (i++) + ".zip"; }
        return n;
    }
    static void MakeNames(Snap s) { if (s.newName != null) return; s.newName = NewName(s, s.name, 0); int i = 1; foreach (var d in s.dupes) s.dupeNewNames.Add(NewName(s, d, i++)); }
    static void Finish(Snap s, Stopwatch sw) {
        MakeNames(s);
        string line = string.Format("{0:0000} {1} {2,-9} n={3,-6} +{4} ~{5} -{6} v={7} (name {8}) root=[{9}] {10}{11}{12}", s.seq, s.key, s.kind, s.files, s.added, s.modified, s.deleted, s.verInternal ?? "-", s.verName ?? "-", s.root, s.name, s.dupes.Count > 0 ? "  (+" + s.dupes.Count + " dup)" : "", s.error != null ? "  ERROR " + s.error : "");
        log.WriteLine(line); if (s.seq % 25 == 0) { log.Flush(); Console.WriteLine(sw.Elapsed.ToString(@"hh\:mm\:ss") + " " + line); }
    }
}
