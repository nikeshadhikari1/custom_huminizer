class TextHumanizer {
    constructor() {
        this.currentLevel = 'light';
        this.originalText = '';
        this.humanizedText = '';
        this.sentences = [];
        this.humanizedSentences = [];
        this.sentenceAnalysis = [];
        this.currentSentenceIndex = null;
        this.init();
    }

    init() {
        this.cacheElements();
        this.bindEvents();
        this.updateTheme();
    }

    cacheElements() {
        this.inputText = document.getElementById('inputText');
        this.outputContent = document.getElementById('outputContent');
        this.inputWordCount = document.getElementById('inputWordCount');
        this.humanizeBtn = document.getElementById('humanizeBtn');
        this.copyBtn = document.getElementById('copyBtn');
        this.themeToggle = document.getElementById('themeToggle');
        this.scanOriginalBtn = document.getElementById('scanOriginalBtn');
        this.scanHumanizedBtn = document.getElementById('scanHumanizedBtn');
        this.originalScoreValue = document.getElementById('originalScoreValue');
        this.humanizedScoreValue = document.getElementById('humanizedScoreValue');
        this.originalScoreFill = document.getElementById('originalScoreFill');
        this.humanizedScoreFill = document.getElementById('humanizedScoreFill');
        this.analysisSection = document.getElementById('analysisSection');
        this.analysisContent = document.getElementById('analysisContent');
        this.modalOverlay = document.getElementById('modalOverlay');
        this.modalClose = document.getElementById('modalClose');
        this.originalSentence = document.getElementById('originalSentence');
        this.rewriteOptions = document.getElementById('rewriteOptions');
        this.levelBtns = document.querySelectorAll('.level-btn');
    }

    bindEvents() {
        this.inputText.addEventListener('input', () => this.updateWordCount());
        this.humanizeBtn.addEventListener('click', () => this.humanize());
        this.copyBtn.addEventListener('click', () => this.copyToClipboard());
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.scanOriginalBtn.addEventListener('click', () => this.scanText('original'));
        this.scanHumanizedBtn.addEventListener('click', () => this.scanText('humanized'));
        this.modalClose.addEventListener('click', () => this.closeModal());
        this.modalOverlay.addEventListener('click', (e) => {
            if (e.target === this.modalOverlay) this.closeModal();
        });
        this.levelBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.levelBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentLevel = btn.dataset.level;
            });
        });
    }

    updateWordCount() {
        const words = this.inputText.value.trim().split(/\s+/).filter(w => w.length > 0).length;
        this.inputWordCount.textContent = `${words} / 500 words`;
    }

    toggleTheme() {
        const html = document.documentElement;
        const current = html.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    }

    updateTheme() {
        const saved = localStorage.getItem('theme');
        if (saved) {
            document.documentElement.setAttribute('data-theme', saved);
        }
    }

    splitIntoSentences(text) {
        return text.match(/[^.!?]+[.!?]*\s*/g) || [text];
    }

    getSynonyms() {
        return {
            'utilize': ['use', 'make use of', 'employ'],
            'utilizes': ['uses', 'employs'],
            'utilized': ['used', 'employed'],
            'demonstrate': ['show', 'prove', 'display'],
            'demonstrates': ['shows', 'proves', 'displays'],
            'demonstrated': ['showed', 'proved', 'displayed'],
            'implement': ['put in place', 'set up', 'roll out'],
            'implements': ['puts in place', 'sets up'],
            'implemented': ['put in place', 'set up', 'rolled out'],
            'significant': ['big', 'major', 'notable', 'important'],
            'significantly': ['greatly', 'notably', 'considerably'],
            'substantial': ['large', 'considerable', 'big'],
            'substantially': ['considerably', 'greatly', 'largely'],
            'comprehensive': ['thorough', 'complete', 'full'],
            'comprehensively': ['thoroughly', 'completely'],
            'furthermore': ['also', 'plus', 'besides', 'on top of that'],
            'moreover': ['also', 'plus', 'besides'],
            'nevertheless': ['still', 'even so', 'that said'],
            'nonetheless': ['still', 'even so'],
            'consequently': ['so', 'as a result', 'because of this'],
            'therefore': ['so', 'because of this', 'as a result'],
            'however': ['but', 'though', 'that said'],
            'additionally': ['also', 'plus', 'on top of that'],
            'regarding': ['about', 'when it comes to', 'as for'],
            'approximately': ['about', 'around', 'roughly'],
            'sufficient': ['enough', 'adequate'],
            'numerous': ['many', 'lots of', 'plenty of'],
            'acquire': ['get', 'obtain', 'pick up'],
            'acquired': ['got', 'obtained'],
            'possess': ['have', 'own'],
            'possesses': ['has', 'owns'],
            'indicate': ['show', 'suggest', 'point to'],
            'indicates': ['shows', 'suggests'],
            'indicated': ['showed', 'suggested'],
            'establish': ['set up', 'create', 'build'],
            'establishes': ['sets up', 'creates'],
            'established': ['set up', 'created'],
            'facilitate': ['help', 'make easier', 'enable'],
            'facilitates': ['helps', 'makes easier'],
            'facilitated': ['helped', 'made easier'],
            'enhance': ['boost', 'improve', 'strengthen'],
            'enhances': ['boosts', 'improves'],
            'enhanced': ['boosted', 'improved'],
            'essential': ['key', 'crucial', 'vital', 'necessary'],
            'essentially': ['basically', 'mainly', 'mostly'],
            'optimal': ['best', 'ideal', 'perfect'],
            'sophisticated': ['complex', 'advanced', 'elaborate'],
            'methodology': ['method', 'approach', 'way'],
            'phenomenon': ['event', 'occurrence'],
            'paradigm': ['model', 'framework', 'pattern'],
            'perspective': ['view', 'point of view', 'angle'],
            'fundamental': ['basic', 'core', 'key'],
            'fundamentally': ['basically', 'at its core'],
            'subsequently': ['later', 'after that', 'then'],
            'simultaneously': ['at the same time', 'together'],
            'predominantly': ['mostly', 'mainly', 'largely'],
            'elaborate': ['detailed', 'complex', 'thorough'],
            'initiate': ['start', 'begin', 'launch'],
            'initiates': ['starts', 'begins'],
            'initiated': ['started', 'began', 'launched'],
            'endeavor': ['try', 'attempt', 'effort'],
            'endeavors': ['tries', 'attempts'],
            'procure': ['get', 'obtain', 'secure'],
            'ascertain': ['find out', 'figure out', 'determine'],
            'constitute': ['make up', 'form', 'represent'],
            'constitutes': ['makes up', 'forms'],
            'elucidate': ['explain', 'clarify', 'clear up'],
            'exemplify': ['illustrate', 'show', 'demonstrate'],
            'expedite': ['speed up', 'hurry', 'accelerate'],
            'formulate': ['develop', 'create', 'come up with'],
            'formulates': ['develops', 'creates'],
            'formulated': ['developed', 'created'],
            'incorporate': ['include', 'add', 'build in'],
            'incorporates': ['includes', 'adds'],
            'incorporated': ['included', 'added'],
            'necessitate': ['require', 'need'],
            'necessitates': ['requires', 'needs'],
            'perceive': ['see', 'view', 'regard'],
            'perceives': ['sees', 'views'],
            'perceived': ['seen', 'viewed'],
            'proliferate': ['spread', 'multiply', 'grow rapidly'],
            'requisite': ['required', 'needed', 'necessary'],
            'scrutinize': ['examine', 'inspect closely', 'study carefully'],
            'specify': ['state', 'detail', 'spell out'],
            'specifies': ['states', 'details'],
            'specified': ['stated', 'detailed'],
            'sustain': ['maintain', 'keep up', 'support'],
            'sustains': ['maintains', 'keeps up'],
            'sustained': ['maintained', 'kept up'],
            'trivial': ['minor', 'small', 'unimportant'],
            'unprecedented': ['unlike anything before', 'never seen before'],
            'validate': ['confirm', 'verify', 'check'],
            'validates': ['confirms', 'verifies'],
            'validated': ['confirmed', 'verified'],
            'viable': ['workable', 'feasible', 'practical'],
            'whereas': ['while', 'but', 'although'],
            'thus': ['so', 'this way'],
            'hence': ['so', 'because of this'],
            'albeit': ['although', 'even though'],
            'via': ['through', 'by way of'],
            'important': ['key', 'crucial', 'vital', 'necessary'],
            'importantly': ['significantly', 'notably', 'crucially'],
            'necessary': ['needed', 'required', 'essential'],
            'required': ['needed', 'necessary', 'essential'],
            'needed': ['required', 'necessary', 'essential'],
            'vital': ['essential', 'crucial', 'key'],
            'crucial': ['essential', 'vital', 'key'],
            'major': ['big', 'significant', 'important'],
            'big': ['large', 'major', 'significant'],
            'large': ['big', 'major', 'significant'],
            'small': ['little', 'minor', 'tiny'],
            'huge': ['enormous', 'massive', 'gigantic'],
            'enormous': ['huge', 'massive', 'gigantic'],
            'massive': ['huge', 'enormous', 'gigantic'],
            'good': ['great', 'excellent', 'fine'],
            'great': ['excellent', 'fantastic', 'wonderful'],
            'excellent': ['great', 'fantastic', 'wonderful'],
            'amazing': ['incredible', 'astonishing', 'remarkable'],
            'incredible': ['amazing', 'astonishing', 'remarkable'],
            'remarkable': ['notable', 'extraordinary', 'noteworthy'],
            'outstanding': ['exceptional', 'excellent', 'remarkable'],
            'superb': ['excellent', 'outstanding', 'magnificent'],
            'significant': ['important', 'notable', 'considerable'],
            'considerable': ['significant', 'substantial', 'notable'],
            'meaningful': ['significant', 'purposeful', 'worthwhile'],
            'purposeful': ['meaningful', 'intentional', 'deliberate'],
            'aware': ['conscious', 'mindful', 'cognizant'],
            'careful': ['cautious', 'thorough', 'meticulous'],
            'thorough': ['careful', 'complete', 'comprehensive'],
            'complete': ['thorough', 'total', 'full'],
            'total': ['complete', 'full', 'entire'],
            'strong': ['solid', 'powerful', 'robust'],
            'powerful': ['strong', 'mighty', 'forceful'],
            'effective': ['potent', 'successful', 'efficacious'],
            'successful': ['effective', 'triumphant', 'prosperous'],
            'thriving': ['prosperous', 'flourishing', 'booming'],
            'growing': ['expanding', 'developing', 'increasing'],
            'developing': ['growing', 'evolving', 'progressing'],
            'changing': ['evolving', 'shifting', 'transforming'],
            'moving': ['shifting', 'traveling', 'going'],
            'walking': ['strolling', 'ambling', 'hiking'],
            'wandering': ['roaming', 'rambling', 'meandering'],
            'holding': ['gripping', 'keeping', 'retaining'],
            'keeping': ['holding', 'retaining', 'maintaining'],
            'preserving': ['retaining', 'conserving', 'protecting'],
            'saving': ['conserving', 'rescuing', 'preserving'],
            'providing': ['delivering', 'supplying', 'giving'],
            'supplying': ['providing', 'furnishing'],
            'preparing': ['getting ready', 'making ready', 'equipping'],
            'ready': ['prepared', 'set', 'poised'],
            'prepared': ['ready', 'set', 'equipped'],
            'repaired': ['fixed', 'mended', 'restored'],
            'restored': ['renewed', 'revived', 'refreshed'],
            'refreshed': ['renewed', 'revitalized', 'rejuvenated'],
            'energized': ['revitalized', 'invigorated', 'stimulated'],
            'stimulated': ['invigorated', 'aroused', 'excited'],
            'awakened': ['aroused', 'roused', 'woken'],
            'moved': ['stirred', 'touched', 'affected'],
            'affected': ['touched', 'influenced', 'impacted'],
            'influenced': ['affected', 'swayed', 'persuaded'],
            'convinced': ['persuaded', 'certain', 'sure'],
            'certain': ['convinced', 'sure', 'confident'],
            'sure': ['certain', 'confident', 'positive'],
            'confident': ['sure', 'certain', 'self-assured'],
            'calm': ['collected', 'cool', 'peaceful'],
            'peaceful': ['calm', 'tranquil', 'serene'],
            'quiet': ['serene', 'silent', 'still'],
            'still': ['motionless', 'stationary', 'quiet'],
            'steady': ['stable', 'firm', 'consistent'],
            'stable': ['steady', 'firm', 'solid'],
            'firm': ['stable', 'solid', 'strong'],
            'solid': ['firm', 'strong', 'sturdy'],
            'tough': ['hardy', 'resilient', 'durable'],
            'resilient': ['tough', 'durable', 'flexible'],
            'durable': ['resilient', 'long-lasting', 'sturdy'],
            'lasting': ['enduring', 'permanent', 'persistent'],
            'permanent': ['lasting', 'enduring', 'fixed'],
            'continuous': ['uninterrupted', 'constant', 'unbroken'],
            'whole': ['entire', 'complete', 'intact'],
            'maximum': ['full', 'utmost', 'greatest'],
            'ultimate': ['supreme', 'final', 'last'],
            'final': ['ultimate', 'last', 'concluding'],
            'ending': ['concluding', 'finishing', 'closing'],
            'beginning': ['opening', 'starting', 'commencing'],
            'starting': ['beginning', 'commencing', 'initiating'],
            'launching': ['initiating', 'starting', 'beginning'],
            'research': ['studies', 'investigation', 'analysis'],
            'studies': ['research', 'investigations', 'analyses'],
            'investigation': ['research', 'study', 'examination'],
            'analysis': ['examination', 'study', 'review'],
            'examination': ['analysis', 'study', 'inspection'],
            'approach': ['method', 'way', 'strategy'],
            'method': ['approach', 'way', 'technique'],
            'strategy': ['approach', 'plan', 'method'],
            'technique': ['method', 'approach', 'skill'],
            'process': ['procedure', 'method', 'system'],
            'procedure': ['process', 'method', 'protocol'],
            'system': ['method', 'framework', 'structure'],
            'framework': ['system', 'structure', 'model'],
            'structure': ['framework', 'system', 'organization'],
            'organization': ['structure', 'system', 'arrangement'],
            'arrangement': ['organization', 'structure', 'setup'],
            'setup': ['arrangement', 'configuration', 'system'],
            'configuration': ['setup', 'arrangement', 'layout'],
            'layout': ['arrangement', 'configuration', 'design'],
            'design': ['layout', 'plan', 'pattern'],
            'pattern': ['design', 'model', 'template'],
            'model': ['pattern', 'framework', 'example'],
            'template': ['pattern', 'model', 'guide'],
            'guide': ['template', 'reference', 'manual'],
            'reference': ['guide', 'source', 'resource'],
            'resource': ['source', 'reference', 'material'],
            'material': ['resource', 'substance', 'content'],
            'content': ['material', 'substance', 'information'],
            'information': ['content', 'data', 'details'],
            'data': ['information', 'facts', 'figures'],
            'facts': ['data', 'information', 'details'],
            'details': ['information', 'facts', 'particulars'],
            'particulars': ['details', 'specifics', 'facts'],
            'specifics': ['details', 'particulars', 'particulars'],
            'particular': ['specific', 'specific', 'detail'],
            'specific': ['particular', 'particular', 'detail'],
            'general': ['broad', 'overall', 'widespread'],
            'broad': ['general', 'wide', 'extensive'],
            'wide': ['broad', 'extensive', 'vast'],
            'extensive': ['wide', 'broad', 'comprehensive'],
            'vast': ['huge', 'enormous', 'extensive'],
            'huge': ['vast', 'enormous', 'massive'],
            'enormous': ['huge', 'vast', 'massive'],
            'massive': ['huge', 'enormous', 'vast'],
            'tiny': ['small', 'little', 'minute'],
            'minute': ['tiny', 'small', 'minuscule'],
            'minuscule': ['tiny', 'minute', 'microscopic'],
            'microscopic': ['tiny', 'minuscule', 'invisible'],
            'invisible': ['unseen', 'hidden', 'imperceptible'],
            'hidden': ['concealed', 'secret', 'invisible'],
            'concealed': ['hidden', 'secret', 'covered'],
            'secret': ['hidden', 'confidential', 'private'],
            'confidential': ['secret', 'private', 'restricted'],
            'private': ['personal', 'confidential', 'individual'],
            'personal': ['private', 'individual', 'intimate'],
            'individual': ['personal', 'single', 'separate'],
            'single': ['individual', 'one', 'sole'],
            'sole': ['single', 'only', 'exclusive'],
            'only': ['sole', 'single', 'just'],
            'just': ['only', 'simply', 'merely'],
            'simply': ['just', 'only', 'merely'],
            'merely': ['just', 'only', 'simply'],
            'purely': ['simply', 'only', 'just'],
            'exclusively': ['only', 'solely', 'purely'],
            'solely': ['only', 'exclusively', 'purely'],
            'entirely': ['completely', 'totally', 'fully'],
            'completely': ['entirely', 'totally', 'fully'],
            'totally': ['completely', 'entirely', 'fully'],
            'fully': ['completely', 'entirely', 'totally'],
            'wholly': ['completely', 'entirely', 'totally'],
            'absolutely': ['completely', 'totally', 'entirely'],
            'perfectly': ['completely', 'flawlessly', 'ideally'],
            'flawlessly': ['perfectly', 'impeccably', 'seamlessly'],
            'impeccably': ['flawlessly', 'perfectly', 'faultlessly'],
            'seamlessly': ['smoothly', 'flawlessly', 'effortlessly'],
            'smoothly': ['seamlessly', 'effortlessly', 'easily'],
            'effortlessly': ['smoothly', 'easily', 'naturally'],
            'easily': ['effortlessly', 'simply', 'readily'],
            'readily': ['easily', 'willingly', 'quickly'],
            'quickly': ['fast', 'rapidly', 'swiftly'],
            'fast': ['quickly', 'rapidly', 'swiftly'],
            'rapidly': ['quickly', 'fast', 'swiftly'],
            'swiftly': ['quickly', 'rapidly', 'fast'],
            'speedily': ['quickly', 'rapidly', 'swiftly'],
            'gradually': ['slowly', 'little by little', 'over time'],
            'slowly': ['gradually', 'little by little', 'unhurriedly'],
            'immediately': ['right away', 'instantly', 'at once'],
            'instantly': ['immediately', 'right away', 'at once'],
            'promptly': ['quickly', 'right away', 'without delay'],
            'recently': ['lately', 'not long ago', 'just'],
            'lately': ['recently', 'of late', 'not long ago'],
            'formerly': ['previously', 'earlier', 'once'],
            'previously': ['formerly', 'earlier', 'before'],
            'earlier': ['previously', 'before', 'formerly'],
            'eventually': ['in the end', 'finally', 'ultimately'],
            'finally': ['eventually', 'in the end', 'ultimately'],
            'ultimately': ['eventually', 'finally', 'in the end'],
            'currently': ['presently', 'now', 'at present'],
            'presently': ['currently', 'now', 'soon'],
            'present': ['current', 'existing', 'here'],
            'existing': ['current', 'present', 'in place'],
            'ongoing': ['continuing', 'in progress', 'underway'],
            'continuing': ['ongoing', 'persistent', 'uninterrupted'],
            'persistent': ['continuing', 'constant', 'steady'],
            'constant': ['persistent', 'steady', 'unchanging'],
            'steady': ['constant', 'stable', 'consistent'],
            'consistent': ['steady', 'reliable', 'uniform'],
            'reliable': ['dependable', 'consistent', 'trustworthy'],
            'dependable': ['reliable', 'consistent', 'trustworthy'],
            'trustworthy': ['reliable', 'dependable', 'credible'],
            'credible': ['believable', 'trustworthy', 'plausible'],
            'believable': ['credible', 'plausible', 'convincing'],
            'plausible': ['believable', 'credible', 'reasonable'],
            'reasonable': ['plausible', 'sensible', 'fair'],
            'sensible': ['reasonable', 'practical', 'logical'],
            'practical': ['sensible', 'pragmatic', 'realistic'],
            'pragmatic': ['practical', 'realistic', 'sensible'],
            'realistic': ['practical', 'pragmatic', 'sensible'],
            'logical': ['rational', 'reasonable', 'sensible'],
            'rational': ['logical', 'reasonable', 'sensible'],
            'reasonable': ['sensible', 'fair', 'moderate'],
            'fair': ['reasonable', 'just', 'equitable'],
            'just': ['fair', 'equitable', 'righteous'],
            'equitable': ['fair', 'just', 'impartial'],
            'impartial': ['fair', 'unbiased', 'neutral'],
            'unbiased': ['impartial', 'neutral', 'objective'],
            'neutral': ['impartial', 'unbiased', 'objective'],
            'objective': ['impartial', 'unbiased', 'factual'],
            'factual': ['objective', 'accurate', 'true'],
            'accurate': ['correct', 'precise', 'exact'],
            'correct': ['accurate', 'right', 'proper'],
            'proper': ['correct', 'appropriate', 'suitable'],
            'appropriate': ['proper', 'suitable', 'fitting'],
            'suitable': ['appropriate', 'proper', 'fitting'],
            'fitting': ['appropriate', 'suitable', 'proper'],
            'proper': ['correct', 'appropriate', 'suitable'],
            'correct': ['accurate', 'right', 'proper'],
            'right': ['correct', 'proper', 'appropriate'],
            'wrong': ['incorrect', 'mistaken', 'erroneous'],
            'incorrect': ['wrong', 'mistaken', 'erroneous'],
            'mistaken': ['wrong', 'incorrect', 'erroneous'],
            'erroneous': ['wrong', 'incorrect', 'mistaken'],
            'false': ['incorrect', 'wrong', 'untrue'],
            'untrue': ['false', 'incorrect', 'wrong'],
            'true': ['accurate', 'correct', 'real'],
            'real': ['actual', 'genuine', 'true'],
            'actual': ['real', 'genuine', 'true'],
            'genuine': ['real', 'authentic', 'true'],
            'authentic': ['genuine', 'real', 'original'],
            'original': ['authentic', 'initial', 'first'],
            'initial': ['original', 'first', 'starting'],
            'first': ['initial', 'original', 'primary'],
            'primary': ['main', 'principal', 'chief'],
            'main': ['primary', 'principal', 'chief'],
            'principal': ['main', 'primary', 'chief'],
            'chief': ['main', 'primary', 'principal'],
            'leading': ['main', 'primary', 'foremost'],
            'foremost': ['leading', 'primary', 'principal'],
            'top': ['leading', 'foremost', 'highest'],
            'highest': ['top', 'supreme', 'utmost'],
            'supreme': ['highest', 'ultimate', 'paramount'],
            'paramount': ['supreme', 'ultimate', 'primary'],
            'ultimate': ['supreme', 'final', 'last'],
            'basic': ['fundamental', 'essential', 'simple'],
            'simple': ['basic', 'easy', 'straightforward'],
            'easy': ['simple', 'effortless', 'straightforward'],
            'straightforward': ['simple', 'easy', 'direct'],
            'direct': ['straightforward', 'clear', 'explicit'],
            'clear': ['obvious', 'evident', 'apparent'],
            'obvious': ['clear', 'evident', 'apparent'],
            'evident': ['clear', 'obvious', 'apparent'],
            'apparent': ['clear', 'obvious', 'evident'],
            'plain': ['clear', 'obvious', 'simple'],
            'simple': ['plain', 'basic', 'easy'],
            'complex': ['complicated', 'intricate', 'elaborate'],
            'complicated': ['complex', 'intricate', 'involved'],
            'intricate': ['complex', 'complicated', 'elaborate'],
            'elaborate': ['complex', 'detailed', 'intricate'],
            'detailed': ['thorough', 'comprehensive', 'elaborate'],
            'thorough': ['detailed', 'comprehensive', 'complete'],
            'comprehensive': ['thorough', 'complete', 'extensive'],
            'extensive': ['comprehensive', 'wide-ranging', 'broad'],
            'wide-ranging': ['extensive', 'comprehensive', 'broad'],
            'broad': ['wide', 'extensive', 'general'],
            'wide': ['broad', 'extensive', 'vast'],
            'narrow': ['limited', 'restricted', 'tight'],
            'limited': ['narrow', 'restricted', 'confined'],
            'restricted': ['limited', 'confined', 'narrow'],
            'confined': ['restricted', 'limited', 'narrow'],
            'tight': ['narrow', 'close', 'secure'],
            'close': ['near', 'tight', 'intimate'],
            'near': ['close', 'nearby', 'adjacent'],
            'nearby': ['close', 'near', 'adjacent'],
            'adjacent': ['nearby', 'neighboring', 'next to'],
            'neighboring': ['adjacent', 'nearby', 'next door'],
            'next': ['following', 'subsequent', 'adjacent'],
            'following': ['next', 'subsequent', 'ensuing'],
            'subsequent': ['following', 'later', 'ensuing'],
            'later': ['subsequent', 'following', 'afterward'],
            'afterward': ['later', 'subsequently', 'then'],
            'then': ['next', 'afterward', 'subsequently'],
            'now': ['currently', 'presently', 'at present'],
            'today': ['nowadays', 'currently', 'presently'],
            'nowadays': ['today', 'currently', 'these days'],
            'yesterday': ['the day before', 'previously', 'recently'],
            'tomorrow': ['the next day', 'soon', 'in the future'],
            'soon': ['shortly', 'before long', 'in a bit'],
            'shortly': ['soon', 'before long', 'in a bit'],
            'early': ['premature', 'initial', 'first'],
            'premature': ['early', 'hasty', 'untimely'],
            'late': ['tardy', 'delayed', 'overdue'],
            'tardy': ['late', 'delayed', 'slow'],
            'delayed': ['late', 'postponed', 'held up'],
            'postponed': ['delayed', 'deferred', 'put off'],
            'deferred': ['postponed', 'delayed', 'put off'],
            'advanced': ['forward', 'ahead', 'progressive'],
            'forward': ['ahead', 'advanced', 'onward'],
            'ahead': ['forward', 'in front', 'leading'],
            'backward': ['backwards', 'reverse', 'retrograde'],
            'backwards': ['backward', 'reverse', 'retrograde'],
            'reverse': ['opposite', 'backward', 'inverse'],
            'opposite': ['contrary', 'reverse', 'reverse'],
            'contrary': ['opposite', 'reverse', 'conflicting'],
            'conflicting': ['contradictory', 'opposing', 'clashing'],
            'contradictory': ['conflicting', 'opposing', 'inconsistent'],
            'opposing': ['contrary', 'conflicting', 'adverse'],
            'adverse': ['opposing', 'unfavorable', 'negative'],
            'unfavorable': ['adverse', 'negative', 'disadvantageous'],
            'negative': ['unfavorable', 'adverse', 'pessimistic'],
            'positive': ['favorable', 'optimistic', 'affirmative'],
            'favorable': ['positive', 'advantageous', 'beneficial'],
            'optimistic': ['positive', 'hopeful', 'confident'],
            'hopeful': ['optimistic', 'positive', 'expectant'],
            'pessimistic': ['negative', 'gloomy', 'cynical'],
            'gloomy': ['pessimistic', 'dark', 'dreary'],
            'dark': ['gloomy', 'dim', 'shadowy'],
            'dim': ['dark', 'faint', 'dull'],
            'faint': ['dim', 'weak', 'slight'],
            'weak': ['feeble', 'frail', 'fragile'],
            'feeble': ['weak', 'frail', 'faint'],
            'frail': ['weak', 'fragile', 'delicate'],
            'fragile': ['delicate', 'frail', 'breakable'],
            'delicate': ['fragile', 'fine', 'subtle'],
            'fine': ['delicate', 'good', 'excellent'],
            'subtle': ['delicate', 'nuanced', 'understated'],
            'nuanced': ['subtle', 'complex', 'sophisticated'],
            'understated': ['subtle', 'restrained', 'modest'],
            'restrained': ['understated', 'controlled', 'moderate'],
            'controlled': ['restrained', 'regulated', 'managed'],
            'regulated': ['controlled', 'managed', 'governed'],
            'managed': ['controlled', 'handled', 'directed'],
            'handled': ['managed', 'dealt with', 'tackled'],
            'dealt': ['handled', 'managed', 'addressed'],
            'addressed': ['dealt with', 'handled', 'tackled'],
            'tackled': ['addressed', 'handled', 'confronted'],
            'confronted': ['faced', 'tackled', 'encountered'],
            'faced': ['confronted', 'encountered', 'met'],
            'encountered': ['faced', 'met', 'experienced'],
            'experienced': ['encountered', 'undergone', 'felt'],
            'felt': ['experienced', 'sensed', 'perceived'],
            'sensed': ['felt', 'perceived', 'detected'],
            'perceived': ['sensed', 'noticed', 'observed'],
            'noticed': ['perceived', 'observed', 'spotted'],
            'observed': ['noticed', 'watched', 'seen'],
            'watched': ['observed', 'monitored', 'viewed'],
            'viewed': ['watched', 'seen', 'looked at'],
            'seen': ['viewed', 'watched', 'observed'],
            'looked': ['viewed', 'watched', 'gazed'],
            'gazed': ['looked', 'stared', 'peered'],
            'stared': ['gazed', 'looked', 'glared'],
            'glared': ['stared', 'looked', 'scowled'],
            'peered': ['looked', 'gazed', 'squinted'],
            'squinted': ['peered', 'looked', 'narrowed eyes'],
            'glanced': ['looked', 'peeked', 'glimpsed'],
            'peeked': ['glanced', 'looked', 'glimpsed'],
            'glimpsed': ['glanced', 'peeked', 'caught sight of'],
            'spotted': ['noticed', 'saw', 'detected'],
            'detected': ['spotted', 'found', 'discovered'],
            'found': ['discovered', 'located', 'uncovered'],
            'discovered': ['found', 'uncovered', 'revealed'],
            'uncovered': ['discovered', 'found', 'revealed'],
            'revealed': ['uncovered', 'disclosed', 'exposed'],
            'disclosed': ['revealed', 'exposed', 'made known'],
            'exposed': ['revealed', 'uncovered', 'unveiled'],
            'unveiled': ['revealed', 'exposed', 'introduced'],
            'introduced': ['presented', 'brought in', 'launched'],
            'presented': ['introduced', 'showed', 'displayed'],
            'showed': ['presented', 'displayed', 'demonstrated'],
            'displayed': ['showed', 'exhibited', 'presented'],
            'exhibited': ['displayed', 'showed', 'presented'],
            'demonstrated': ['showed', 'proved', 'illustrated'],
            'proved': ['demonstrated', 'shown', 'established'],
            'illustrated': ['demonstrated', 'showed', 'depicted'],
            'depicted': ['illustrated', 'portrayed', 'represented'],
            'portrayed': ['depicted', 'represented', 'described'],
            'represented': ['portrayed', 'depicted', 'symbolized'],
            'symbolized': ['represented', 'stood for', 'signified'],
            'signified': ['symbolized', 'meant', 'indicated'],
            'meant': ['signified', 'intended', 'signaled'],
            'intended': ['meant', 'planned', 'aimed'],
            'planned': ['intended', 'organized', 'arranged'],
            'organized': ['planned', 'arranged', 'structured'],
            'arranged': ['organized', 'planned', 'set up'],
            'structured': ['organized', 'arranged', 'formatted'],
            'formatted': ['structured', 'arranged', 'laid out'],
            'laid': ['placed', 'set', 'positioned'],
            'placed': ['put', 'set', 'positioned'],
            'put': ['placed', 'set', 'positioned'],
            'set': ['placed', 'put', 'positioned'],
            'positioned': ['placed', 'set', 'located'],
            'located': ['situated', 'placed', 'found'],
            'situated': ['located', 'placed', 'positioned'],
            'found': ['established', 'based', 'built'],
            'established': ['founded', 'created', 'set up'],
            'founded': ['established', 'created', 'started'],
            'created': ['made', 'produced', 'generated'],
            'made': ['created', 'produced', 'built'],
            'produced': ['created', 'made', 'generated'],
            'generated': ['produced', 'created', 'yielded'],
            'yielded': ['produced', 'generated', 'provided'],
            'provided': ['supplied', 'given', 'offered'],
            'supplied': ['provided', 'given', 'furnished'],
            'given': ['provided', 'supplied', 'offered'],
            'offered': ['provided', 'given', 'presented'],
            'presented': ['offered', 'given', 'submitted'],
            'submitted': ['presented', 'offered', 'handed in'],
            'handed': ['passed', 'given', 'delivered'],
            'passed': ['handed', 'given', 'transferred'],
            'transferred': ['moved', 'shifted', 'relocated'],
            'moved': ['transferred', 'shifted', 'relocated'],
            'shifted': ['moved', 'transferred', 'changed'],
            'changed': ['altered', 'modified', 'transformed'],
            'altered': ['changed', 'modified', 'adjusted'],
            'modified': ['changed', 'altered', 'adjusted'],
            'adjusted': ['modified', 'altered', 'adapted'],
            'adapted': ['adjusted', 'modified', 'customized'],
            'customized': ['adapted', 'tailored', 'personalized'],
            'tailored': ['customized', 'adapted', 'fitted'],
            'personalized': ['customized', 'tailored', 'individualized'],
            'individualized': ['personalized', 'customized', 'tailored'],
            'specialized': ['specific', 'particular', 'focused'],
            'specific': ['particular', 'specific', 'precise'],
            'particular': ['specific', 'specific', 'particular'],
            'precise': ['exact', 'accurate', 'specific'],
            'exact': ['precise', 'accurate', 'specific'],
            'accurate': ['precise', 'exact', 'correct'],
            'correct': ['accurate', 'right', 'proper'],
            'right': ['correct', 'proper', 'appropriate'],
            'proper': ['correct', 'appropriate', 'suitable'],
            'appropriate': ['proper', 'suitable', 'fitting'],
            'suitable': ['appropriate', 'proper', 'fitting'],
            'fitting': ['appropriate', 'suitable', 'proper'],
            'proper': ['correct', 'appropriate', 'suitable'],
            'correct': ['accurate', 'right', 'proper'],
            'right': ['correct', 'proper', 'appropriate'],
        };
    }

    getContractions() {
        return {
            'I am': "I'm",
            'you are': "you're",
            'he is': "he's",
            'she is': "she's",
            'it is': "it's",
            'we are': "we're",
            'they are': "they're",
            'I have': "I've",
            'you have': "you've",
            'we have': "we've",
            'they have': "they've",
            'I will': "I'll",
            'you will': "you'll",
            'he will': "he'll",
            'she will': "she'll",
            'it will': "it'll",
            'we will': "we'll",
            'they will': "they'll",
            'I would': "I'd",
            'you would': "you'd",
            'he would': "he'd",
            'she would': "she'd",
            'it would': "it'd",
            'we would': "we'd",
            'they would': "they'd",
            'is not': "isn't",
            'are not': "aren't",
            'was not': "wasn't",
            'were not': "weren't",
            'do not': "don't",
            'does not': "doesn't",
            'did not': "didn't",
            'has not': "hasn't",
            'have not': "haven't",
            'had not': "hadn't",
            'will not': "won't",
            'would not': "wouldn't",
            'could not': "couldn't",
            'should not': "shouldn't",
            'cannot': "can't",
            'that is': "that's",
            'there is': "there's",
            'here is': "here's",
            'what is': "what's",
            'where is': "where's",
            'when is': "when's",
            'why is': "why's",
            'how is': "how's",
            'who is': "who's",
            'let us': "let's",
        };
    }

    getRandomItem(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    replaceSynonyms(text, level) {
        const synonyms = this.getSynonyms();
        let result = text;
        const words = Object.keys(synonyms);
        const sortedWords = words.sort((a, b) => b.length - a.length);

        for (const word of sortedWords) {
            const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
            if (regex.test(result)) {
                const replacements = synonyms[word];
                const shouldReplace = level === 'aggressive' ? Math.random() < 0.9 :
                    level === 'medium' ? Math.random() < 0.7 : Math.random() < 0.4;

                if (shouldReplace) {
                    const replacement = this.getRandomItem(replacements);
                    result = result.replace(regex, (match) => {
                        if (match[0] === match[0].toUpperCase()) {
                            return replacement.charAt(0).toUpperCase() + replacement.slice(1);
                        }
                        return replacement;
                    });
                }
            }
        }

        return result;
    }

    applyContractions(text, level) {
        const contractions = this.getContractions();
        let result = text;
        const shouldApply = level === 'aggressive' ? 0.9 : level === 'medium' ? 0.7 : 0.5;

        for (const [full, contraction] of Object.entries(contractions)) {
            const regex = new RegExp(`\\b${full.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
            if (regex.test(result) && Math.random() < shouldApply) {
                result = result.replace(regex, (match) => {
                    if (match[0] === match[0].toUpperCase()) {
                        return contraction.charAt(0).toUpperCase() + contraction.slice(1);
                    }
                    return contraction;
                });
            }
        }

        return result;
    }

    varySentenceStructure(sentence, level) {
        let result = sentence;
        const starters = ['Well,', 'Look,', 'Honestly,', 'Basically,', 'Truth is,', 'The thing is,', "Here's the deal,", 'Fact is,', 'Simply put,', 'In short,'];
        const fillers = [' you know', ' I mean', ' honestly', ' basically', ' really', ' just', ' kind of', ' sort of'];

        if (level === 'aggressive') {
            if (Math.random() < 0.3) {
                const starter = this.getRandomItem(starters);
                if (!result.match(/^(Well|Look|Honestly|Basically|Truth|The thing|Here|Fact|Simply|In short)/i)) {
                    result = starter + ' ' + result.charAt(0).toLowerCase() + result.slice(1);
                }
            }

            if (Math.random() < 0.2) {
                const filler = this.getRandomItem(fillers);
                const words = result.split(' ');
                if (words.length > 4) {
                    const insertPos = Math.floor(Math.random() * (words.length - 2)) + 1;
                    words.splice(insertPos, 0, filler.replace(/^ /, ''));
                    result = words.join(' ');
                }
            }

            if (Math.random() < 0.25) {
                const questions = ['Right?', 'Makes sense?', "You know what I mean?", "See what I'm saying?", 'Get it?'];
                if (result.endsWith('.') && Math.random() < 0.3) {
                    result = result.slice(0, -1) + ' — ' + this.getRandomItem(questions);
                }
            }
        } else if (level === 'medium') {
            if (Math.random() < 0.15) {
                const starter = this.getRandomItem(['Basically,', 'Honestly,', 'Truth is,', 'Simply put,']);
                if (!result.match(/^(Well|Look|Honestly|Basically|Truth|The thing|Here|Fact|Simply|In short)/i)) {
                    result = starter + ' ' + result.charAt(0).toLowerCase() + result.slice(1);
                }
            }
        }

        return result;
    }

    removeAIPatterns(text, level) {
        let result = text;
        const patterns = [
            { regex: /\bIt is important to note that\b/gi, replacements: ['Importantly,', 'Keep in mind,', 'Notably,'] },
            { regex: /\bIt should be noted that\b/gi, replacements: ['Notably,', 'Importantly,', 'Worth noting:'] },
            { regex: /\bIt is worth mentioning that\b/gi, replacements: ['Notably,', 'Interestingly,', 'Worth noting:'] },
            { regex: /\bThere is a need to\b/gi, replacements: ['We need to', "There's a need to"] },
            { regex: /\bIt is evident that\b/gi, replacements: ['Clearly,', 'Obviously,', 'Evidently,'] },
            { regex: /\bIt is apparent that\b/gi, replacements: ['Clearly,', 'Apparently,', "It's clear that"] },
            { regex: /\bIt can be seen that\b/gi, replacements: ['We can see that', 'Clearly,', 'Evidently,'] },
            { regex: /\bResearch has shown that\b/gi, replacements: ['Studies show', 'Research shows', 'We know from research that'] },
            { regex: /\bResearch indicates that\b/gi, replacements: ['Research shows', 'Studies suggest', 'We know that'] },
            { regex: /\bStudies have shown that\b/gi, replacements: ['Studies show', 'Research shows', "We've learned that"] },
            { regex: /\bIt has been demonstrated that\b/gi, replacements: ["We've shown that", "It's clear that", 'Evidence shows that'] },
            { regex: /\bIt is widely recognized that\b/gi, replacements: ['Most agree that', "It's well known that", 'Widely known:'] },
            { regex: /\bIt is generally accepted that\b/gi, replacements: ['Most agree that', "It's widely accepted that", 'Commonly known:'] },
            { regex: /\bIn conclusion\b/gi, replacements: ['To wrap up,', 'All in all,', 'In the end,'] },
            { regex: /\bIn summary\b/gi, replacements: ['To sum up,', 'In short,', 'Basically,'] },
            { regex: /\bTo summarize\b/gi, replacements: ['In short,', 'To sum up,', 'Basically,'] },
            { regex: /\bIn essence\b/gi, replacements: ['Basically,', 'Essentially,', 'At its core,'] },
            { regex: /\bOn the other hand\b/gi, replacements: ['Then again,', 'But then,', 'Alternatively,'] },
            { regex: /\bIn contrast\b/gi, replacements: ['By comparison,', 'On the flip side,', 'Conversely,'] },
            { regex: /\bBy contrast\b/gi, replacements: ['On the flip side,', 'Conversely,', 'Compared to that,'] },
            { regex: /\bIt is imperative that\b/gi, replacements: ["It's crucial that", "It's vital that", 'We must'] },
            { regex: /\bIt is crucial that\b/gi, replacements: ["It's vital that", "It's key that", 'We really need to'] },
            { regex: /\bIt is vital that\b/gi, replacements: ["It's crucial that", "It's essential that", 'We really need to'] },
            { regex: /\bA number of\b/gi, replacements: ['Several', 'Some', 'Various'] },
            { regex: /\bA wide range of\b/gi, replacements: ['Many', 'Various', 'Different'] },
            { regex: /\bA variety of\b/gi, replacements: ['Various', 'Different', 'Many'] },
            { regex: /\bIn order to\b/gi, replacements: ['To', 'So as to'] },
            { regex: /\bIn the event that\b/gi, replacements: ['If', 'When', 'Should'] },
            { regex: /\bDue to the fact that\b/gi, replacements: ['Because', 'Since', 'As'] },
            { regex: /\bFor the purpose of\b/gi, replacements: ['To', 'For', 'With the goal of'] },
            { regex: /\bIn light of\b/gi, replacements: ['Considering', 'Given', 'Because of'] },
            { regex: /\bIn accordance with\b/gi, replacements: ['Following', 'According to', 'As per'] },
            { regex: /\bWith respect to\b/gi, replacements: ['About', 'Regarding', 'Concerning'] },
            { regex: /\bOn the basis of\b/gi, replacements: ['Based on', 'According to', 'From'] },
            { regex: /\bWith regard to\b/gi, replacements: ['About', 'Regarding', 'When it comes to'] },
            { regex: /\bIn regard to\b/gi, replacements: ['About', 'Regarding', 'When it comes to'] },
        ];

        for (const pattern of patterns) {
            if (pattern.regex.test(result)) {
                const shouldReplace = level === 'aggressive' ? Math.random() < 0.9 :
                    level === 'medium' ? Math.random() < 0.7 : Math.random() < 0.4;

                if (shouldReplace) {
                    const replacement = this.getRandomItem(pattern.replacements);
                    result = result.replace(pattern.regex, replacement);
                }
            }
        }

        return result;
    }

    addHumanVariation(text, level) {
        let result = text;

        if (level === 'aggressive') {
            if (Math.random() < 0.15) {
                const hedges = ['I guess', 'I suppose', 'I think', 'It seems like', 'From what I can tell'];
                const sentences = result.split('. ');
                if (sentences.length > 2) {
                    const insertPos = Math.floor(Math.random() * (sentences.length - 1)) + 1;
                    sentences.splice(insertPos, 0, this.getRandomItem(hedges));
                    result = sentences.join('. ');
                }
            }
        }

        if (level === 'aggressive' || level === 'medium') {
            result = result.replace(/\bvery\b/gi, () => {
                const intensifiers = ['really', 'pretty', 'quite', 'super'];
                return this.getRandomItem(intensifiers);
            });

            result = result.replace(/\bwell\b/gi, () => {
                const modifiers = ['pretty', 'quite', 'fairly', 'rather'];
                return this.getRandomItem(modifiers);
            });
        }

        return result;
    }

    humanizeSentence(sentence, level) {
        let result = sentence.trim();
        if (!result) return result;

        result = this.removeAIPatterns(result, level);
        result = this.replaceSynonyms(result, level);
        result = this.applyContractions(result, level);
        result = this.varySentenceStructure(result, level);
        result = this.addHumanVariation(result, level);

        return result;
    }

    generateAlternatives(sentence, level) {
        const alternatives = [];
        const levels = ['light', 'medium', 'aggressive'];

        for (const lvl of levels) {
            const alt = this.humanizeSentence(sentence, lvl);
            if (alt !== sentence && !alternatives.includes(alt)) {
                alternatives.push(alt);
            }
        }

        while (alternatives.length < 3) {
            const alt = this.humanizeSentence(sentence, level);
            if (!alternatives.includes(alt)) {
                alternatives.push(alt);
            }
        }

        return alternatives.slice(0, 3);
    }

    humanize() {
        const input = this.inputText.value.trim();
        if (!input) return;

        this.originalText = input;
        this.humanizeBtn.disabled = true;
        this.humanizeBtn.innerHTML = '<span class="loading"></span> Humanizing...';

        setTimeout(() => {
            this.sentences = this.splitIntoSentences(input);
            this.humanizedSentences = this.sentences.map(s => this.humanizeSentence(s, this.currentLevel));
            this.humanizedText = this.humanizedSentences.join(' ');

            this.outputContent.innerHTML = `<p class="fade-in">${this.humanizedText}</p>`;
            this.copyBtn.disabled = false;
            this.scanHumanizedBtn.disabled = false;

            this.humanizeBtn.disabled = false;
            this.humanizeBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
                Humanize Text
            `;

            this.analyzeSentences();
        }, 800);
    }

    analyzeSentences() {
        this.sentenceAnalysis = this.humanizedSentences.map((sentence, index) => {
            const score = this.analyzeSentence(sentence);
            return {
                sentence: sentence.trim(),
                score: score,
                classification: score > 60 ? 'ai' : score > 35 ? 'mixed' : 'human',
                original: this.sentences[index]?.trim() || sentence.trim()
            };
        });

        this.renderAnalysis();
    }

    analyzeSentence(sentence) {
        let score = 50;
        const lower = sentence.toLowerCase();

        const aiPatterns = [
            /\bit is important to note\b/i,
            /\bit should be noted\b/i,
            /\bin conclusion\b/i,
            /\bin summary\b/i,
            /\bfurthermore\b/i,
            /\bmoreover\b/i,
            /\bnevertheless\b/i,
            /\bnonetheless\b/i,
            /\bconsequently\b/i,
            /\btherefore\b/i,
            /\butilize\b/i,
            /\bdemonstrate\b/i,
            /\bimplement\b/i,
            /\bcomprehensive\b/i,
            /\bsophisticated\b/i,
            /\bmethodology\b/i,
            /\bparadigm\b/i,
            /\bphenomenon\b/i,
            /\bunprecedented\b/i,
            /\bmultifaceted\b/i,
            /\bholistic\b/i,
            /\brobust\b/i,
            /\bseamless\b/i,
            /\bcutting-edge\b/i,
            /\bstate-of-the-art\b/i,
            /\bleveraging\b/i,
            /\bsynergy\b/i,
            /\bparadigm shift\b/i,
            /\bthink outside the box\b/i,
            /\bat the end of the day\b/i,
            /\bin today's world\b/i,
            /\bit is worth noting\b/i,
            /\bplays a crucial role\b/i,
            /\bplays a significant role\b/i,
            /\bin order to\b/i,
            /\bdue to the fact\b/i,
            /\bfor the purpose of\b/i,
            /\bin light of\b/i,
            /\bin accordance with\b/i,
            /\bwith respect to\b/i,
            /\bon the basis of\b/i,
            /\ba number of\b/i,
            /\ba wide range of\b/i,
            /\ba variety of\b/i,
        ];

        const humanPatterns = [
            /\bI think\b/i,
            /\bI guess\b/i,
            /\bI suppose\b/i,
            /\bkind of\b/i,
            /\bsort of\b/i,
            /\byou know\b/i,
            /\bI mean\b/i,
            /\bhonestly\b/i,
            /\bbasically\b/i,
            /\btruth is\b/i,
            /\bthe thing is\b/i,
            /\bhere's the deal\b/i,
            /\bfact is\b/i,
            /\bsimply put\b/i,
            /\bin short\b/i,
            /\bwell\b/i,
            /\blook\b/i,
            /\banyway\b/i,
            /\banyhow\b/i,
            /\bpretty\b/i,
            /\bquite\b/i,
            /\brather\b/i,
            /\bfairly\b/i,
            /\breally\b/i,
            /\bjust\b/i,
            /\bonly\b/i,
            /\bsimply\b/i,
            /\bactually\b/i,
            /\bliterally\b/i,
            /\bbasically\b/i,
            /\bessentially\b/i,
            /\bgenerally\b/i,
            /\busually\b/i,
            /\btypically\b/i,
            /\bnormally\b/i,
            /\bcommonly\b/i,
            /\bfrequently\b/i,
            /\boften\b/i,
            /\bregularly\b/i,
            /\bconsistently\b/i,
            /\bconstantly\b/i,
            /\bcontinuously\b/i,
            /\bcontinually\b/i,
            /\bpersistently\b/i,
            /\brepeatedly\b/i,
            /\boccasionally\b/i,
            /\bsometimes\b/i,
            /\brarely\b/i,
            /\bseldom\b/i,
            /\bhardly\b/i,
            /\bbarely\b/i,
            /\bscarcely\b/i,
            /\bnearly\b/i,
            /\balmost\b/i,
            /\bpractically\b/i,
            /\bvirtually\b/i,
            /\bcertainly\b/i,
            /\bdefinitely\b/i,
            /\bsurely\b/i,
            /\bundoubtedly\b/i,
            /\bunquestionably\b/i,
            /\bindubitably\b/i,
            /\bobviously\b/i,
            /\bclearly\b/i,
            /\bevidently\b/i,
            /\bapparently\b/i,
            /\bseemingly\b/i,
            /\bostensibly\b/i,
            /\bsupposedly\b/i,
            /\ballegedly\b/i,
            /\breportedly\b/i,
            /\bpresumably\b/i,
            /\bprobably\b/i,
            /\blikely\b/i,
            /\bpossibly\b/i,
            /\bperhaps\b/i,
            /\bmaybe\b/i,
            /\bconceivably\b/i,
            /\bpotentially\b/i,
            /\barguably\b/i,
            /\bnotably\b/i,
            /\bespecially\b/i,
            /\bparticularly\b/i,
            /\bspecifically\b/i,
            /\bexplicitly\b/i,
            /\bimplicitly\b/i,
            /\btacitly\b/i,
        ];

        for (const pattern of aiPatterns) {
            if (pattern.test(lower)) {
                score += 8;
            }
        }

        for (const pattern of humanPatterns) {
            if (pattern.test(lower)) {
                score -= 6;
            }
        }

        const words = sentence.split(/\s+/);
        if (words.length > 25) {
            score += 10;
        } else if (words.length < 10) {
            score -= 5;
        }

        const contractionCount = (sentence.match(/'/g) || []).length;
        score -= contractionCount * 5;

        if (sentence.includes(' — ') || sentence.includes('...') || sentence.includes('Right?') || sentence.includes('Makes sense?')) {
            score -= 10;
        }

        return Math.max(0, Math.min(100, score));
    }

    renderAnalysis() {
        this.analysisSection.style.display = 'block';
        let html = '';

        this.sentenceAnalysis.forEach((item, index) => {
            html += `<span class="sentence ${item.classification}" data-index="${index}" title="${item.score}% AI-like">${item.sentence} </span>`;
        });

        this.analysisContent.innerHTML = html;

        this.analysisContent.querySelectorAll('.sentence').forEach(el => {
            el.addEventListener('click', () => {
                const index = parseInt(el.dataset.index);
                this.showRewriteModal(index);
            });
        });

        this.analysisSection.scrollIntoView({ behavior: 'smooth' });
    }

    showRewriteModal(index) {
        this.currentSentenceIndex = index;
        const item = this.sentenceAnalysis[index];

        this.originalSentence.textContent = item.original;

        const alternatives = this.generateAlternatives(item.original, this.currentLevel);
        let html = '';

        alternatives.forEach((alt, i) => {
            const isSelected = alt === item.sentence;
            html += `<div class="rewrite-option ${isSelected ? 'selected' : ''}" data-alt="${i}">${alt}</div>`;
        });

        this.rewriteOptions.innerHTML = html;

        this.rewriteOptions.querySelectorAll('.rewrite-option').forEach(el => {
            el.addEventListener('click', () => {
                this.rewriteOptions.querySelectorAll('.rewrite-option').forEach(o => o.classList.remove('selected'));
                el.classList.add('selected');

                const altIndex = parseInt(el.dataset.alt);
                this.humanizedSentences[index] = alternatives[altIndex];
                this.humanizedText = this.humanizedSentences.join(' ');
                this.outputContent.innerHTML = `<p class="fade-in">${this.humanizedText}</p>`;

                this.sentenceAnalysis[index].sentence = alternatives[altIndex];
                this.sentenceAnalysis[index].score = this.analyzeSentence(alternatives[altIndex]);
                this.sentenceAnalysis[index].classification = this.sentenceAnalysis[index].score > 60 ? 'ai' : this.sentenceAnalysis[index].score > 35 ? 'mixed' : 'human';

                this.renderAnalysis();
            });
        });

        this.modalOverlay.style.display = 'flex';
    }

    closeModal() {
        this.modalOverlay.style.display = 'none';
        this.currentSentenceIndex = null;
    }

    scanText(type) {
        const text = type === 'original' ? this.originalText : this.humanizedText;
        if (!text) return;

        const sentences = this.splitIntoSentences(text);
        let totalScore = 0;

        sentences.forEach(sentence => {
            totalScore += this.analyzeSentence(sentence);
        });

        const avgScore = Math.round(totalScore / sentences.length);

        if (type === 'original') {
            this.originalScoreValue.textContent = `${avgScore}%`;
            const circumference = 2 * Math.PI * 40;
            const offset = circumference - (avgScore / 100) * circumference;
            this.originalScoreFill.style.strokeDashoffset = offset;

            this.originalScoreFill.classList.remove('high', 'medium', 'low');
            if (avgScore > 60) {
                this.originalScoreFill.classList.add('high');
            } else if (avgScore > 35) {
                this.originalScoreFill.classList.add('medium');
            } else {
                this.originalScoreFill.classList.add('low');
            }

            document.querySelector('#originalScore .score-label').textContent = avgScore > 60 ? 'Likely AI' : avgScore > 35 ? 'Mixed' : 'Likely Human';
        } else {
            this.humanizedScoreValue.textContent = `${avgScore}%`;
            const circumference = 2 * Math.PI * 40;
            const offset = circumference - (avgScore / 100) * circumference;
            this.humanizedScoreFill.style.strokeDashoffset = offset;

            this.humanizedScoreFill.classList.remove('high', 'medium', 'low');
            if (avgScore > 60) {
                this.humanizedScoreFill.classList.add('high');
            } else if (avgScore > 35) {
                this.humanizedScoreFill.classList.add('medium');
            } else {
                this.humanizedScoreFill.classList.add('low');
            }

            document.querySelector('#humanizedScore .score-label').textContent = avgScore > 60 ? 'Likely AI' : avgScore > 35 ? 'Mixed' : 'Likely Human';
        }
    }

    copyToClipboard() {
        navigator.clipboard.writeText(this.humanizedText).then(() => {
            const originalText = this.copyBtn.innerHTML;
            this.copyBtn.innerHTML = '✓ Copied!';
            setTimeout(() => {
                this.copyBtn.innerHTML = originalText;
            }, 2000);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TextHumanizer();
});
