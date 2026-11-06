'use strict';
/* Sztuczna inteligencja – ćwiczenia praktyczne. Czysty JavaScript, bez bibliotek. */

const KEY='bezpieczenstwo-podstawy-v1';
const state={best:{},tried:{}};
try{const s=JSON.parse(localStorage.getItem(KEY)||'null'); if(s){state.best=s.best||{}; state.tried=s.tried||{}}}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}}
const $=s=>document.querySelector(s);
function h(html){const t=document.createElement('template');t.innerHTML=html.trim();return t.content.firstElementChild}
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
let cleanup=null, current='intro';

/* ---------- wspólne elementy ---------- */
function result(body,id,score,msg,again){
  const got=finish(id,score);
  body.innerHTML='';
  const nxt=nextId(id);
  const r=h(`<div class="result"><p class="res-score"><span>${got}</span> / 25 pkt</p><p class="res-msg">${msg}</p><div class="row"><button class="btn alt" data-a="again">Powtórz ćwiczenie</button>${nxt?'<button class="btn" data-a="next">Następne ćwiczenie</button>':'<button class="btn" data-a="lib">Przejdź do listy „Zrób to dziś”</button>'}</div></div>`);
  body.append(r);
  r.querySelector('[data-a=again]').onclick=again;
  const n=r.querySelector('[data-a=next],[data-a=lib]'); n.onclick=()=>nxt?openStation(nxt):showLibrary(); n.focus();
}
function finish(id,score){
  score=Math.max(0,Math.min(25,Math.round(score)));
  if(state.best[id]==null||score>state.best[id]) state.best[id]=score;
  save(); renderNav(); return score;
}
function quiz(body,id,qs,{noShuffle=false,intro=''}={}){
  let i=0,ok=0; const list=noShuffle?qs:shuffle(qs);
  const restart=()=>quiz(body,id,qs,{noShuffle,intro});
  function show(){
    const q=list[i]; body.innerHTML='';
    if(intro&&i===0) body.append(h(`<p class="lead">${intro}</p>`));
    body.append(h(`<p class="progress">Pytanie ${i+1} z ${list.length}</p>`));
    if(q.mock) body.append(h(q.mock));
    body.append(h(`<p class="q">${q.q}</p>`));
    const opts=h('<div class="opts"></div>'); body.append(opts);
    const order=q.fixed?q.o.map((t,k)=>k):shuffle(q.o.map((t,k)=>k));
    order.forEach(k=>{
      const b=h(`<button class="opt">${q.o[k]}</button>`);
      b.onclick=()=>{
        const right=k===q.a; if(right) ok++;
        opts.querySelectorAll('button').forEach((x,n)=>{x.disabled=true; if(order[n]===q.a) x.classList.add('right')});
        if(!right) b.classList.add('wrong');
        body.append(h(`<div class="feedback${right?'':' bad'}"><b>${right?'Dobrze.':'Niestety nie.'}</b>${q.why}</div>`));
        const nx=h(`<div class="row"><button class="btn">${i+1<list.length?'Dalej':'Zobacz wynik'}</button></div>`);
        body.append(nx); const nb=nx.querySelector('button'); nb.focus();
        nb.onclick=()=>{i++; if(i<list.length) show(); else result(body,id,ok/list.length*25,`Poprawne odpowiedzi: ${ok} z ${list.length}.`,restart)};
      };
      opts.append(b);
    });
  }
  show();
}
function sortTask(body,id,items,bins,intro,endMsg){
  const restart=()=>sortTask(body,id,items,bins,intro,endMsg);
  const I=shuffle(items); let sel=null,left=I.length,bad=0; const done=[];
  body.innerHTML=`<p class="lead">${intro} Kliknij element, a potem kategorię. Możesz też przeciągnąć element myszką.</p>`;
  const desk=h('<div class="desk sortdesk"></div>'); body.append(desk);
  const bx=h('<div class="folders"></div>'); body.append(bx);
  const hint=h('<p class="hint" aria-live="polite"></p>'); body.append(hint);
  I.forEach((x,k)=>{const b=h(`<button class="file card-item" draggable="true" data-k="${k}">${x.n}</button>`);
    b.onclick=()=>{desk.querySelectorAll('.file').forEach(y=>y.classList.remove('sel')); sel=k; b.classList.add('sel'); hint.textContent='Teraz kliknij kategorię.'};
    b.ondragstart=e=>{e.dataTransfer.setData('text/plain',String(k)); sel=k}; desk.append(b)});
  bins.forEach(([v,n])=>{const b=h(`<button class="folder">${n}<span class="cnt">0</span></button>`); let c=0;
    const drop=k=>{if(k==null){hint.textContent='Najpierw kliknij element.';return} const x=I[k], el=desk.querySelector(`[data-k="${k}"]`); if(!el) return;
      const right=x.v===v; if(!right) bad++;
      el.remove(); c++; b.querySelector('.cnt').textContent=c; left--; sel=null;
      const label=bins.find(z=>z[0]===x.v)[1];
      done.push(`<li class="${right?'':'miss'}"><b>${x.n}</b> — ${label.toLowerCase()}. ${x.why}</li>`);
      hint.textContent=right?'Dobrze.':`Nie. Właściwa kategoria: ${label}. ${x.why}`;
      if(!left) setTimeout(()=>{result(body,id,(I.length-bad)/I.length*25,`Dobre decyzje: ${I.length-bad} z ${I.length}. ${endMsg}`,restart); body.querySelector('.result').append(h(`<ul class="whylist">${done.join('')}</ul>`))},600)};
    b.onclick=()=>drop(sel); b.ondragover=e=>{e.preventDefault(); b.classList.add('over')}; b.ondragleave=()=>b.classList.remove('over');
    b.ondrop=e=>{e.preventDefault(); b.classList.remove('over'); drop(+e.dataTransfer.getData('text/plain'))}; bx.append(b)});
}

function plural(n,one,few,many){if(n===1)return one; const d=n%10,dd=n%100; return (d>=2&&d<=4&&!(dd>=12&&dd<=14))?few:many}

/* ---------- wspólne: zaznaczanie błędów w tekście ---------- */
function hotTask(body,id,cfg){
  const restart=()=>hotTask(body,id,cfg);
  const flags=cfg.parts.filter(a=>a[1]===1).length;
  body.innerHTML=`<p class="lead">${cfg.lead} W tekście ${plural(flags,'jest','są','jest')} ${flags} ${plural(flags,...(cfg.words||['błąd','błędy','błędów']))}. ${cfg.action||'Kliknij fragmenty, które trzeba poprawić.'} Kliknięcie jeszcze raz cofa zaznaczenie. Potem kliknij „Sprawdź”.</p>`;
  if(cfg.facts) body.append(h(`<div class="facts"><p class="ca-l">Twoje fakty</p><p>${cfg.facts}</p></div>`));
  const box=h(`<div class="chatans ${cfg.doc?'cvdoc':''}"><p class="ca-l">${cfg.label}</p><div class="ca-t"></div></div>`); body.append(box);
  const t=box.querySelector('.ca-t');
  cfg.parts.forEach(a=>{const s=h(`<button class="hs" aria-pressed="false">${a[0]}</button>`); s._a=a; s.onclick=()=>s.setAttribute('aria-pressed',String(s.getAttribute('aria-pressed')!=='true'));
    if(cfg.doc){const line=h('<p class="cvline"></p>'); line.append(s); t.append(line)} else {t.append(s); t.append(document.createTextNode(' '))}});
  const ctl=h('<div class="row"><button class="btn">Sprawdź</button></div>'); body.append(ctl);
  ctl.querySelector('button').onclick=()=>{
    let f=0,w=0; const out=[];
    t.querySelectorAll('.hs').forEach(s=>{const on=s.getAttribute('aria-pressed')==='true', a=s._a; s.disabled=true;
      if(a[1]===1){if(on){f++; s.classList.add('hs-ok')} else s.classList.add('hs-miss'); out.push(`<li class="${on?'':'miss'}"><b>${on?'Znalezione':'Pominięte'}:</b> ${a[2]}</li>`)}
      else if(on){w++; s.classList.add('hs-bad'); out.push(`<li class="miss"><b>Niepotrzebnie zaznaczone:</b> ${a[2]}</li>`)}});
    ctl.remove();
    result(body,id,(f-0.5*w)/flags*25,`${cfg.found||'Znalezione błędy'}: ${f} z ${flags}. Niepotrzebne zaznaczenia: ${w}. ${cfg.endMsg}`,restart);
    const r=body.querySelector('.result'); box.style.marginTop='20px'; r.append(box); r.append(h(`<ul class="whylist">${out.join('')}</ul>`));
  };
}


function poolQuiz(items,pool){return items.map(([q,a,why])=>{const others=shuffle(pool.map((p,k)=>k).filter(k=>k!==a)).slice(0,3); return {q,o:[a,...others].map(k=>pool[k]),a:0,why}})}
const sms=(from,msg)=>`<div class="phone"><div class="ph-top">${from}</div><div class="bubble">${msg}</div></div>`;
const call=(n,s)=>`<div class="call"><p class="call-n">${n}</p><p class="call-s">${s}</p></div>`;
const urlbox=u=>`<div class="urlbox"><span class="lock" aria-hidden="true">🔒</span><span>${u}</span></div>`;

/* ---------- 1. Hasła ---------- */
const QPASS=[
 {mock:'<p class="pw">Kasia1985</p>',q:'Jak oceniasz to hasło?',o:['Słabe','Mocne'],a:0,fixed:1,why:'Imię i rok urodzenia łatwo odgadnąć. Takie informacje często są w mediach społecznościowych.'},
 {mock:'<p class="pw">Lato2026!</p>',q:'Jak oceniasz to hasło?',o:['Słabe','Mocne'],a:0,fixed:1,why:'Pora roku, rok i wykrzyknik to bardzo popularny wzór. Programy do łamania haseł sprawdzają go na początku.'},
 {mock:'<p class="pw">Qwerty123</p>',q:'Jak oceniasz to hasło?',o:['Słabe','Mocne'],a:0,fixed:1,why:'Litery z klawiatury po kolei i proste liczby to jedne z najczęstszych haseł na świecie.'},
 {mock:'<p class="pw">kalosz-pietruszka-mgła-rower</p>',q:'Jak oceniasz to hasło?',o:['Słabe','Mocne'],a:1,fixed:1,why:'Kilka losowych słów daje długie hasło, które łatwo zapamiętać, a trudno odgadnąć. Nie używaj tego przykładu jako swojego hasła.'},
 {mock:'<p class="pw">Tr7#qL</p>',q:'Jak oceniasz to hasło?',o:['Słabe','Mocne'],a:0,fixed:1,why:'Wygląda trudno, ale ma tylko 6 znaków. Długość jest ważniejsza niż dziwne znaki.'},
 {q:'Masz jedno dobre hasło do poczty, banku i sklepu internetowego. Co jest problemem?',o:['Wyciek danych ze sklepu otwiera też pocztę i bank','Nic, jeśli hasło jest dobre','Hasło szybciej się „zużywa”'],a:0,fixed:1,why:'Oszuści sprawdzają wykradzione hasła w innych serwisach. Każde konto powinno mieć inne hasło.'},
 {q:'Przychodzi powiadomienie „Czy to ty się logujesz?”, a ty nic nie robisz. Co robisz?',o:['Odrzucam i zmieniam hasło do tego konta','Zatwierdzam, żeby powiadomienie zniknęło','Nic nie robię'],a:0,fixed:1,why:'Ktoś zna twoje hasło. Zatrzymało go tylko logowanie dwuetapowe. Zmień hasło od razu.'}
];

/* ---------- 2. SMS-y ---------- */
const QSMS=[
 {mock:sms('+48 731 XXX XXX','Twoja paczka czeka. Dopłać 1,99 zł: paczka-dostawa24.top/oplata'),q:'Nie czekasz na żadną paczkę. Co to jest?',o:['Raczej prawdziwa wiadomość','Raczej oszustwo'],a:1,fixed:1,why:'Mała kwota, dziwny adres i nieznany numer. Celem są dane karty. Przekaż SMS na numer 8080.'},
 {mock:sms('MójBank','Twoje konto zostało zablokowane. Odblokuj je tutaj: mojbank-weryfikacja.com'),q:'Co to jest?',o:['Raczej prawdziwa wiadomość','Raczej oszustwo'],a:1,fixed:1,why:'Nazwę nadawcy w SMS-ie można podrobić. Bank nie wysyła linków do logowania. Wejdź do aplikacji banku samodzielnie.'},
 {mock:sms('MójBank','Twój kod do logowania: 482917. Nie podawaj go nikomu.'),q:'Przed chwilą logujesz się do swojego banku i dostajesz ten SMS. Co to jest?',o:['Raczej prawdziwa wiadomość','Raczej oszustwo'],a:0,fixed:1,why:'Kod przyszedł, bo właśnie się logujesz. Wpisz go tylko w aplikacji lub na stronie banku i nie podawaj nikomu.'},
 {mock:sms('MójBank','Twój kod do logowania: 913540. Nie podawaj go nikomu.'),q:'Nie logujesz się teraz do banku, a ktoś dzwoni i prosi o ten kod „do weryfikacji”. Co robisz?',o:['Podaję kod, żeby zakończyć weryfikację','Nie podaję kodu, rozłączam się i dzwonię do banku'],a:1,fixed:1,why:'Ktoś próbuje zalogować się na twoje konto. Kod jest ostatnią przeszkodą. Nikt z banku o niego nie prosi.'},
 {mock:sms('+48 600 XXX XXX','Mamo, to ja, zepsuł mi się telefon i to mój nowy numer. Możesz pilnie wysłać BLIK na 500 zł?'),q:'Co robisz?',o:['Dzwonię do dziecka na stary, znany numer','Wysyłam BLIK — to pilne','Odpisuję i pytam, na co potrzebuje pieniędzy'],a:0,why:'Odpisanie nic nie da, bo odpowie oszust. Tylko telefon na znany numer pozwala to sprawdzić.'},
 {mock:sms('Energia','Dziś o 21:00 odłączymy prąd z powodu zaległej płatności 12,48 zł. Zapłać: energia-oplata.top'),q:'Co to jest?',o:['Raczej prawdziwa wiadomość','Raczej oszustwo'],a:1,fixed:1,why:'Presja czasu, mała kwota i dziwny adres. Prawdziwy dostawca prądu wysyła pisemne wezwania, a zaległość sprawdzisz w jego oficjalnej aplikacji lub na rachunku.'}
];

/* ---------- 3. E-mail ---------- */
const MAIL=[
 ['Od: Poczta Polska &lt;powiadomienia@poczta-polska-paczki.top&gt;',1,'Prawdziwa firma nie wysyła maili z dziwnej domeny .top.'],
 ['Temat: Twoja przesyłka czeka na odbiór',0,'Sam temat wygląda zwyczajnie.'],
 ['Drogi Kliencie,',1,'Ogólne powitanie zamiast imienia i nazwiska.'],
 ['nie mogliśmy doręczyć przesyłki nr 00459123.',0,'Takie zdanie może być w prawdziwej wiadomości.'],
 ['Jeśli nie potwierdzisz adresu w ciągu 24 godzin, przesyłka wróci do nadawcy.',1,'Presja czasu.'],
 ['Kliknij tutaj, aby potwierdzić adres i zapłacić 2,50 zł.',1,'Link do płatności w mailu. Prawdziwy adres strony jest ukryty pod napisem.'],
 ['Załącznik: Etykieta_przesylki.zip',1,'Nieoczekiwane archiwum ZIP może zawierać złośliwy program.'],
 ['Pozdrawiamy, Zespół Obsługi Klienta',0,'Zwykłe zakończenie.']
];

/* ---------- 4. Adresy ---------- */
const QURL=[
 {mock:urlbox('https://mojbank.pl/logowanie'),q:'Twój bank to fikcyjny MójBank, jego strona to mojbank.pl. Czy ten adres prowadzi do banku?',o:['Prawdziwa strona','Podróbka'],a:0,fixed:1,why:'Domena to mojbank.pl. „/logowanie” to tylko część strony.'},
 {mock:urlbox('https://mojbank.pl.logowanie-24.com/'),q:'A ten adres?',o:['Prawdziwa strona','Podróbka'],a:1,fixed:1,why:'Liczy się końcówka przed pierwszym „/”: logowanie-24.com. Początek „mojbank.pl.” to tylko przebranie.'},
 {mock:urlbox('https://login.mojbank.pl/'),q:'A ten adres?',o:['Prawdziwa strona','Podróbka'],a:0,fixed:1,why:'„login.” przed nazwą to część tej samej strony. Adres nadal kończy się na mojbank.pl.'},
 {mock:urlbox('https://rnojbank.pl/logowanie'),q:'A ten adres?',o:['Prawdziwa strona','Podróbka'],a:1,fixed:1,why:'„rn” zamiast „m”. Na pierwszy rzut oka wygląda tak samo.'},
 {mock:urlbox('https://moj-bank.pl/'),q:'A ten adres?',o:['Prawdziwa strona','Podróbka'],a:1,fixed:1,why:'Myślnik zmienia adres. moj-bank.pl to inna strona niż mojbank.pl.'},
 {mock:urlbox('https://mojbank.pl'),q:'Strona ma kłódkę obok adresu. Czy kłódka znaczy, że strona jest uczciwa?',o:['Tak, kłódka gwarantuje bezpieczeństwo','Nie, kłódka oznacza tylko szyfrowane połączenie'],a:1,fixed:1,why:'Fałszywe strony też mają kłódkę. Zawsze sprawdzaj adres.'}
];

/* ---------- 5. Telefon: ustawienia ---------- */
const PHONE=[
 {n:'Blokada ekranu kodem PIN lub odciskiem palca',v:'t',why:'Bez blokady każdy, kto weźmie telefon, ma dostęp do banku i poczty.'},
 {n:'Aktualizacje instalowane od razu',v:'t',why:'Aktualizacje naprawiają luki, które znają oszuści.'},
 {n:'Aplikacje tylko ze sklepu Google Play lub App Store',v:'t',why:'Sklepy sprawdzają aplikacje. To nie daje pełnej gwarancji, ale bardzo zmniejsza ryzyko.'},
 {n:'Włączona usługa „Znajdź urządzenie”',v:'t',why:'Zgubiony telefon można zablokować i zlokalizować.'},
 {n:'Kopia zdjęć w chmurze',v:'t',why:'Zgubiony telefon nie oznacza utraty zdjęć.'},
 {n:'Telefon bez blokady ekranu, „bo tak szybciej”',v:'n',why:'To otwarte drzwi do wszystkich kont.'},
 {n:'Aplikacja kurierska zainstalowana z linku w SMS-ie',v:'n',why:'Aplikacje spoza sklepu mogą czytać SMS-y z kodami i przejmować bankowość.'},
 {n:'Latarka z dostępem do kontaktów i SMS-ów',v:'n',why:'Latarka nie potrzebuje kontaktów ani SMS-ów. To sygnał ostrzegawczy.'},
 {n:'Aktualizacje odkładane od pół roku',v:'n',why:'Telefon bez aktualizacji ma znane luki w zabezpieczeniach.'},
 {n:'PIN do telefonu: 1234',v:'n',why:'To jeden z pierwszych kodów, które ktoś spróbuje wpisać.'}
];

/* ---------- 6. Telefony od oszustów ---------- */
const QCALL=[
 {mock:call('Bank – Dział Bezpieczeństwa','+48 22 XXX XX XX · połączenie przychodzące'),q:'„Wykryliśmy podejrzany przelew. Aby go zatrzymać, przenieś pieniądze na bezpieczne konto techniczne.” Co robisz?',o:['Rozłączam się i dzwonię na numer infolinii z karty płatniczej','Robię przelew, bo na ekranie jest numer banku','Pytam rozmówcę o imię i nazwisko'],a:0,why:'Numer na ekranie można podrobić. Bank nigdy nie prosi o przelew na „bezpieczne konto”.'},
 {mock:call('Policja','połączenie przychodzące'),q:'„Prowadzimy akcję przeciwko oszustom. Pomóż nam: wypłać pieniądze i przekaż je naszemu funkcjonariuszowi.” Co robisz?',o:['Rozłączam się i dzwonię pod numer 112','Pomagam policji','Wypłacam tylko połowę'],a:0,why:'Policja nigdy nie prosi o pieniądze ani o udział w „akcji” przez telefon.'},
 {mock:call('Córka','połączenie przychodzące'),q:'Głos córki mówi, że miała wypadek i pilnie potrzebuje pieniędzy. Głos brzmi trochę dziwnie. Co robisz?',o:['Rozłączam się i dzwonię do córki na jej numer','Wysyłam pieniądze od razu','Proszę o numer konta SMS-em'],a:0,why:'Głos da się podrobić za pomocą AI. Warto ustalić z rodziną hasło na takie sytuacje.'},
 {mock:call('Pomoc techniczna','połączenie przychodzące'),q:'„Twój komputer ma wirusa. Zainstaluj program do zdalnej pomocy, a my go naprawimy.” Co robisz?',o:['Rozłączam się i niczego nie instaluję','Instaluję program','Podaję tylko hasło do komputera'],a:0,why:'Taki program daje oszustowi pełną kontrolę nad komputerem, także nad bankowością.'},
 {mock:call('Urząd','+48 XXX XXX XXX · komunikator'),q:'„Twoja decyzja o pobycie jest zagrożona. Zapłać dziś 800 zł, a sprawę załatwimy.” Co robisz?',o:['Nie płacę i sprawdzam sprawę w urzędzie wojewódzkim','Płacę, żeby nie stracić prawa pobytu','Wysyłam zdjęcie paszportu do sprawdzenia'],a:0,why:'Urzędy nie załatwiają spraw pobytu przez komunikatory i nie żądają pilnych opłat przez telefon. Sprawy pobytu prowadzą urzędy wojewódzkie.'}
];

/* ---------- 7. Pieniądze w internecie ---------- */
const QMONEY=[
 {q:'Sprzedajesz kurtkę na portalu ogłoszeniowym. „Kupujący” przysyła link, żeby „odebrać pieniądze”. Strona prosi o dane karty. Co robisz?',o:['Nie podaję danych. Do przelewu wystarczy numer konta','Podaję dane karty, żeby dostać pieniądze','Podaję tylko numer karty, bez kodu CVC'],a:0,why:'To bardzo częste oszustwo. Do odebrania pieniędzy nie potrzeba danych karty, kodu BLIK ani logowania do banku.'},
 {q:'Co sprawdzasz w aplikacji banku przed zatwierdzeniem BLIK-a?',o:['Kwotę i miejsce płatności','Tylko to, czy kod się zgadza','Nic, BLIK jest zawsze bezpieczny'],a:0,why:'Oszust może podać ci kod do wypłaty z bankomatu zamiast płatności. Aplikacja pokazuje, co naprawdę zatwierdzasz.'},
 {q:'Sklep internetowy sprzedaje telefon za połowę ceny. Nie ma danych firmy, płatność tylko przelewem na prywatne konto. Co robisz?',o:['Nie kupuję — to typowe sygnały fałszywego sklepu','Kupuję szybko, zanim cena wzrośnie','Kupuję, ale zapłacę połowę'],a:0,why:'Zbyt niska cena, brak danych firmy i przelew na prywatne konto to sygnały ostrzegawcze.'},
 {q:'Chcesz zalogować się do banku. Jak najbezpieczniej?',o:['Przez aplikację banku albo wpisując adres strony samodzielnie','Przez link z SMS-a','Przez reklamę w wyszukiwarce'],a:0,why:'Link z SMS-a i reklama mogą prowadzić do fałszywej strony.'},
 {q:'Widzisz w internecie zbiórkę „dla rodzin z Ukrainy” z prywatnym numerem konta. Co robisz?',o:['Wpłacam przez oficjalną stronę znanej organizacji','Wpłacam na podany numer','Udostępniam zbiórkę znajomym bez sprawdzenia'],a:0,why:'Oszuści wykorzystują dobre serca. Wpłacaj przez oficjalne strony organizacji, które znasz.'},
 {q:'„Kupujący” pisze: „Przelałem za dużo, zwróć mi różnicę”. Na koncie nie widzisz pieniędzy. Co robisz?',o:['Sprawdzam saldo w aplikacji banku i nic nie zwracam, dopóki pieniądze nie wpłyną','Zwracam różnicę od razu','Zwracam, bo przysłał zrzut ekranu przelewu'],a:0,why:'Zrzut ekranu łatwo podrobić. Liczy się tylko to, co widzisz na swoim koncie.'}
];

/* ---------- 8. Prywatność ---------- */
const POSTS=[
 {n:'Zdjęcie zachodu słońca nad morzem',v:'t',why:'Nie zdradza danych osobowych.'},
 {n:'Przepis na ulubione ciasto',v:'t',why:'Bez danych osobowych.'},
 {n:'Zdjęcia z wakacji po powrocie do domu',v:'t',why:'Po powrocie nikt nie dowie się, że mieszkanie stoi puste.'},
 {n:'Informacja o ukończonym kursie komputerowym',v:'t',why:'To może pomóc w szukaniu pracy.'},
 {n:'Gratulacje dla koleżanki z okazji nowej pracy',v:'t',why:'Bez szczegółów o jej danych — w porządku.'},
 {n:'Zdjęcie nowej karty pobytu',v:'n',why:'Dokument zawiera dane, które oszust może wykorzystać.'},
 {n:'Karta pokładowa przed lotem',v:'n',why:'Kod kreskowy zawiera twoje dane i numer rezerwacji.'},
 {n:'„Wyjeżdżamy na dwa tygodnie, wracamy 20 sierpnia”',v:'n',why:'Informuje obcych, że mieszkanie jest puste.'},
 {n:'Zdjęcie dziecka przed szkołą z widoczną nazwą szkoły',v:'n',why:'Obcy wiedzą, gdzie codziennie jest dziecko.'},
 {n:'Zdjęcie karty płatniczej „bo jest ładna”',v:'n',why:'Numer karty i inne dane mogą zostać wykorzystane do płatności.'}
];

/* ---------- 9. Co zrobić najpierw ---------- */
const PLACES=['Zadzwonić na infolinię banku','Przekazać SMS na numer 8080 (CERT Polska)','Zgłosić stronę na incydent.cert.pl','Zgłosić utratę dokumentu i zastrzec PESEL','Zablokować telefon zdalnie i zastrzec kartę SIM','Zadzwonić pod numer 112','Zadzwonić do znajomego na jego numer'];
const PQ=[['Podano dane karty na podejrzanej stronie. Co zrobić najpierw?',0,'Bank może zablokować kartę i czasem zatrzymać płatność. Liczy się każda minuta.'],
 ['Dostajesz podejrzany SMS z linkiem do płatności.',1,'CERT Polska analizuje zgłoszone SMS-y i blokuje niebezpieczne strony.'],
 ['Trafiasz na stronę, która podszywa się pod bank.',2,'Zgłoszone strony trafiają na listę ostrzeżeń i są blokowane.'],
 ['Gubisz portfel z dowodem osobistym.',3,'Zgłoszenie utraty unieważnia dokument, a zastrzeżenie PESEL chroni przed kredytem na twoje dane.'],
 ['Ktoś ukradł ci telefon.',4,'Bez karty SIM złodziej nie odbierze kodów SMS. Zadzwoń też do banku.'],
 ['Ktoś grozi ci albo jesteś w niebezpieczeństwie.',5,'112 to numer alarmowy, działa w całej Unii Europejskiej.'],
 ['Konto znajomego na Messengerze prosi o kod BLIK.',6,'Telefon na znany numer potwierdzi, że konto zostało przejęte.']];

/* ---------- Zrób to dziś ---------- */
const CATS=[['telefon','Telefon'],['konta','Konta'],['dom','Dom i rodzina']];
const LIB=[
 {cat:'telefon',t:'Blokada ekranu',d:'PIN, odcisk palca albo rozpoznawanie twarzy.',how:['Android: Ustawienia → Zabezpieczenia lub Ekran blokady.','iPhone: Ustawienia → Face ID i kod albo Touch ID i kod.','Wybierz PIN, którego nie da się łatwo zgadnąć — nie 1234 ani data urodzenia.'],warn:'Nazwy w ustawieniach różnią się w zależności od telefonu.'},
 {cat:'telefon',t:'Aktualizacje',d:'Sprawdź, czy telefon ma najnowszą wersję systemu.',how:['Android: Ustawienia → System lub Aktualizacja oprogramowania.','iPhone: Ustawienia → Ogólne → Uaktualnienia.','Zainstaluj aktualizację najlepiej w nocy, przy ładowaniu.'],warn:'Przed dużą aktualizacją warto mieć kopię zapasową zdjęć.'},
 {cat:'telefon',t:'Znajdź urządzenie',d:'Zablokujesz i zlokalizujesz zgubiony telefon.',how:['Android: Ustawienia → Google → Znajdź urządzenie (nazwa może się różnić).','iPhone: Ustawienia → twoje imię → Znajdź.','Zapamiętaj: z innego urządzenia telefon znajdziesz przez konto Google lub Apple.'],warn:'Usługa działa tylko, gdy jest włączona przed zgubieniem telefonu.'},
 {cat:'telefon',t:'Uprawnienia aplikacji',d:'Sprawdź, które aplikacje mają dostęp do SMS-ów, kontaktów i lokalizacji.',how:['Otwórz ustawienia telefonu i znajdź uprawnienia lub prywatność.','Sprawdź dostęp do SMS-ów, kontaktów, aparatu i lokalizacji.','Wyłącz uprawnienia, których aplikacja nie potrzebuje. Nieużywane aplikacje usuń.'],warn:'Aplikacje banku i komunikatory potrzebują niektórych uprawnień do działania.'},
 {cat:'konta',t:'Logowanie dwuetapowe na poczcie',d:'Najważniejsze konto — przez pocztę zmienisz hasła do innych.',how:['Konto Google: myaccount.google.com → Bezpieczeństwo → Weryfikacja dwuetapowa.','Inne skrzynki: szukaj w ustawieniach bezpieczeństwa.','Zapisz kody zapasowe w bezpiecznym miejscu poza telefonem.'],warn:'Kody zapasowe ratują konto, gdy zgubisz telefon.'},
 {cat:'konta',t:'Sprawdź wycieki',d:'Czy twój adres e-mail był w wycieku danych?',how:['Wejdź na haveibeenpwned.com.','Wpisz swój adres e-mail.','Jeśli adres był w wycieku, zmień hasło w tamtym serwisie i wszędzie tam, gdzie używasz tego samego hasła.'],warn:'Wynik nie oznacza, że konto jest przejęte. Oznacza, że stare hasło jest niebezpieczne.'},
 {cat:'konta',t:'Zastrzeż PESEL',d:'Utrudnisz wzięcie kredytu na twoje dane.',how:['W aplikacji mObywatel, na gov.pl albo w urzędzie gminy.','Zastrzeżenie jest bezpłatne.','Gdy sam potrzebujesz kredytu, możesz je czasowo cofnąć.'],warn:'Zastrzeżenie nie blokuje twojego konta w banku.'},
 {cat:'konta',t:'Ustawienia prywatności',d:'Kto widzi twoje posty, zdjęcia i listę znajomych?',how:['W mediach społecznościowych otwórz ustawienia prywatności.','Ustaw, kto widzi posty: najlepiej znajomi.','Ukryj numer telefonu i datę urodzenia przed obcymi.'],warn:'Stare posty też warto przejrzeć.'},
 {cat:'dom',t:'Ważne numery w telefonie',d:'Numery, które trzeba mieć pod ręką.',how:['Infolinia twojego banku (jest na karcie i w aplikacji).','112 — numer alarmowy.','8080 — tu przekazujesz podejrzane SMS-y.'],warn:'Zapisz infolinię banku jako kontakt, żeby w stresie nie szukać numeru.'},
 {cat:'dom',t:'Hasło rodzinne',d:'Na wypadek telefonu „od bliskiej osoby w kłopotach”.',how:['Ustal z rodziną jedno słowo lub pytanie.','Nie zapisuj go w mediach społecznościowych.','Gdy ktoś dzwoni „z wypadku” — zapytaj o hasło albo rozłącz się i oddzwoń.'],warn:'Głos bliskiej osoby można dziś podrobić za pomocą AI.'},
 {cat:'dom',t:'Kopia zapasowa zdjęć i dokumentów',d:'Zgubiony telefon nie powinien oznaczać utraty wszystkiego.',how:['Włącz kopię w Zdjęciach Google albo w iCloud.','Ważne pliki skopiuj też na komputer lub dysk.','Zdjęcia dokumentów trzymaj w zabezpieczonym miejscu, nie w otwartej galerii.'],warn:'Nie wysyłaj zdjęć dokumentów nikomu bez potrzeby.'}
];
function showLibrary(filter='all'){
  const p=setPanel('lib');
  p.innerHTML=`<h2>Zrób to dziś</h2>
  <p class="desc">Lista rzeczy do ustawienia na swoim telefonie i kontach. Ta część nie jest oceniana. Zaznaczaj to, co już masz zrobione.</p>
  <div class="howto"><p class="howto-w" style="margin:0"><b>Wskazówka:</b> nazwy w ustawieniach różnią się w zależności od telefonu. Jeśli nie możesz czegoś znaleźć, wpisz nazwę w wyszukiwarce ustawień telefonu.</p></div>
  <div class="filters" role="group" aria-label="Kategorie"></div><div class="libgrid"></div>`;
  const f=p.querySelector('.filters'), g=p.querySelector('.libgrid');
  [['all','Wszystkie'],...CATS].forEach(([k,n])=>{const b=h(`<button class="fbtn" aria-pressed="${k===filter}">${n}</button>`); b.onclick=()=>showLibrary(k); f.append(b)});
  LIB.forEach((x,ix)=>{ if(filter!=='all'&&x.cat!==filter) return;
    const id='lib'+ix;
    const c=h(`<article class="libcard"><p class="lc-cat">${CATS.find(z=>z[0]===x.cat)[1]}</p><h3>${x.t}</h3><p class="lc-d">${x.d}</p><p class="lc-l">Jak to zrobić</p><ol class="lc-next">${x.how.map(s=>`<li>${s}</li>`).join('')}</ol>
      <p class="lc-warn"><b>Uwaga:</b> ${x.warn}</p><div class="row lc-row"><label class="lc-tried"><input type="checkbox"${state.tried[id]?' checked':''}> Zrobione</label></div></article>`);
    c.querySelector('.lc-tried input').onchange=e=>{if(e.target.checked) state.tried[id]=1; else delete state.tried[id]; save(); renderNav()};
    g.append(c)});
  focusPanel();
}

/* ---------- wspólne: układanie kolejności ---------- */
function orderTask(body,id,cfg){
  const restart=()=>orderTask(body,id,cfg); const steps=cfg.steps;
  body.innerHTML=`<p class="lead">${cfg.lead} Użyj strzałek, żeby przesunąć krok wyżej lub niżej. Potem kliknij „Sprawdź kolejność”.</p>`;
  const ol=h('<ol class="order"></ol>'); body.append(ol);
  let cur=shuffle(steps.map((_,k)=>k)); if(cur.every((v,k)=>v===k)) cur.reverse();
  const render=(fi,dir)=>{ol.innerHTML=''; cur.forEach((k,pos)=>{const li=h(`<li><span class="ot">${steps[k][0]}</span><span class="ob"><button aria-label="Przesuń wyżej" ${pos===0?'disabled':''}>↑</button><button aria-label="Przesuń niżej" ${pos===cur.length-1?'disabled':''}>↓</button></span></li>`);
    const [u,d]=li.querySelectorAll('button'); u.onclick=()=>{[cur[pos-1],cur[pos]]=[cur[pos],cur[pos-1]]; render(pos-1,'u')}; d.onclick=()=>{[cur[pos+1],cur[pos]]=[cur[pos],cur[pos+1]]; render(pos+1,'d')}; ol.append(li)});
    if(fi!=null){const b=ol.children[fi].querySelectorAll('button'); (dir==='u'?(b[0].disabled?b[1]:b[0]):(b[1].disabled?b[0]:b[1])).focus()}};
  render();
  const ctl=h('<div class="row"><button class="btn">Sprawdź kolejność</button></div>'); body.append(ctl);
  ctl.querySelector('button').onclick=()=>{
    const good=cur.filter((k,pos)=>k===pos).length;
    ctl.remove();
    result(body,id,good/steps.length*25,`Kroki na właściwym miejscu: ${good} z ${steps.length}. ${cfg.endMsg}`,restart);
    body.querySelector('.result').append(h(`<ol class="whylist">${steps.map(s=>`<li><b>${s[0]}.</b> ${s[1]}</li>`).join('')}</ol>`));
  };
}

/* ================= CZĘŚĆ 2 ================= */
const PARTS={1:'Podstawy',2:'Codzienne sytuacje'};
const prompt_=(title,text)=>`<div class="mock"><div class="mt">${title}</div><div class="mb">${text}</div><div class="mbtns"><span class="mbtn">Nie zezwalaj</span><span class="mbtn pri">Zezwól</span></div></div>`;
const post=(who,text)=>`<div class="mock"><div class="mt"><b>${who}</b></div><div class="mb">${text}</div></div>`;

/* ---------- 10. Fałszywy sklep ---------- */
const SHOP=[
 ['Adres strony: tanie-telefony-promocja.shop',1,'Nowa, przypadkowa nazwa strony. Znane sklepy mają stałe, rozpoznawalne adresy.'],
 ['Smartfon Galaxo X12, 256 GB',0,'Zwykły opis produktu.'],
 ['Cena: 499 zł (wszędzie indziej ok. 2500 zł)',1,'Cena kilka razy niższa niż w innych sklepach to typowa przynęta.'],
 ['Promocja kończy się za 09:59 minut!',1,'Odliczanie czasu ma cię pośpieszyć, żeby nie było czasu na sprawdzenie sklepu.'],
 ['Dostawa: 2–3 dni robocze',0,'Zwykła informacja o dostawie.'],
 ['Płatność: tylko przelew na konto prywatne Jan K.',1,'Brak bezpiecznych form płatności i przelew na konto osoby prywatnej.'],
 ['Opinie: „Najlepszy sklep!!!”, „Super!!!”, „Polecam!!!” — wszystkie z dzisiaj',1,'Same zachwyty z jednego dnia wyglądają na fałszywe opinie.'],
 ['Kontakt: tylko formularz, brak nazwy firmy, adresu i NIP',1,'Prawdziwy sklep podaje pełne dane firmy.']
];

/* ---------- 11. Kupujący na portalu ogłoszeniowym ---------- */
const BUYER=[
 ['Kupujący: Dzień dobry, czy kurtka jest jeszcze dostępna?',0,'Zwykłe pytanie.'],
 ['Kupujący: Biorę bez oglądania i bez pytań o cenę.',1,'Brak zainteresowania przedmiotem to częsty sygnał oszustwa.'],
 ['Kupujący: Zapłaciłem już przez „bezpieczną przesyłkę”. Mój kurier odbierze kurtkę.',1,'Oszust wymyśla „usługę”, żeby wysłać ci fałszywy link.'],
 ['Kupujący: Proszę kliknąć link, żeby odebrać pieniądze: odbierz-platnosc-24.com',1,'Link prowadzi do fałszywej strony płatności.'],
 ['Strona z linku: Podaj numer karty, datę ważności i kod CVC, aby otrzymać 180 zł.',1,'Do otrzymania pieniędzy wystarczy numer konta. Dane karty służą do zabrania pieniędzy.'],
 ['Kupujący: Szybko, link wygaśnie za 15 minut!',1,'Presja czasu.'],
 ['Kupujący: Jaki to rozmiar?',0,'Zwykłe pytanie.']
];

/* ---------- 12. Logowanie dwuetapowe: kolejność ---------- */
const STEPS2FA=[
 ['Otwieram ustawienia konta pocztowego','Tam są wszystkie opcje bezpieczeństwa konta.'],
 ['Wchodzę w zakładkę „Bezpieczeństwo”','Na koncie Google: myaccount.google.com → Bezpieczeństwo.'],
 ['Wybieram „Weryfikacja dwuetapowa” i klikam „Włącz”','Nazwa może się różnić w innych skrzynkach pocztowych.'],
 ['Wybieram drugi krok: telefon albo aplikację do logowania','Aplikacja do logowania chroni lepiej niż SMS.'],
 ['Wpisuję kod, który przyszedł, żeby potwierdzić','Tak serwis sprawdza, że drugi krok działa.'],
 ['Zapisuję kody zapasowe w bezpiecznym miejscu','Kody pozwolą się zalogować, gdy zgubisz telefon.']
];

/* ---------- 13. Uprawnienia aplikacji ---------- */
const QPERM=[
 {mock:prompt_('Latarka','Zezwolić aplikacji <b>Latarka</b> na dostęp do SMS-ów?'),q:'Co wybierasz?',o:['Zezwalam','Nie zezwalam'],a:1,fixed:1,why:'Latarka nie potrzebuje SMS-ów. Dostęp do SMS-ów pozwala czytać kody z banku.'},
 {mock:prompt_('Mapy','Zezwolić aplikacji <b>Mapy</b> na dostęp do lokalizacji podczas korzystania z aplikacji?'),q:'Co wybierasz?',o:['Zezwalam','Nie zezwalam'],a:0,fixed:1,why:'Mapy potrzebują lokalizacji, żeby pokazać drogę. „Podczas korzystania” to rozsądny wybór.'},
 {mock:prompt_('Kolorowanki dla dzieci','Zezwolić aplikacji <b>Kolorowanki</b> na dostęp do kontaktów?'),q:'Co wybierasz?',o:['Zezwalam','Nie zezwalam'],a:1,fixed:1,why:'Gra do kolorowania nie potrzebuje twoich kontaktów.'},
 {mock:prompt_('MójBank','Zezwolić aplikacji <b>MójBank</b> na wysyłanie powiadomień?'),q:'Aplikacja banku pobrana ze sklepu. Co wybierasz?',o:['Zezwalam','Nie zezwalam'],a:0,fixed:1,why:'Powiadomienia z banku pomagają szybko zauważyć nieznane operacje i potwierdzać płatności.'},
 {mock:prompt_('Kurier Szybki','Aplikacja <b>Kurier Szybki</b> prosi o włączenie usługi w <b>Ułatwieniach dostępu</b>, aby „działać poprawnie”.'),q:'Aplikację zainstalowano z linku w SMS-ie. Co wybierasz?',o:['Zezwalam','Nie zezwalam'],a:1,fixed:1,why:'Ułatwienia dostępu pozwalają aplikacji widzieć i klikać wszystko na ekranie. Złośliwe aplikacje wykorzystują to do przejmowania bankowości. Taką aplikację usuń.'},
 {mock:prompt_('Aparat','Zezwolić aplikacji <b>Aparat</b> na dostęp do mikrofonu?'),q:'Chcesz nagrywać filmy z dźwiękiem. Co wybierasz?',o:['Zezwalam','Nie zezwalam'],a:0,fixed:1,why:'Do nagrywania filmów z dźwiękiem aparat potrzebuje mikrofonu.'}
];

/* ---------- 14. Sieci i urządzenia poza domem ---------- */
const NETS=[
 {n:'Logowanie do banku przez internet komórkowy',v:'t',why:'Własne połączenie komórkowe jest pewniejsze niż publiczne Wi-Fi.'},
 {n:'Sprawdzenie adresu strony po zeskanowaniu kodu QR',v:'t',why:'Tak wykryjesz fałszywą stronę z podrobionego kodu.'},
 {n:'Udostępnienie internetu z własnego telefonu laptopowi',v:'t',why:'To twoja sieć, a nie obca.'},
 {n:'Domowe Wi-Fi z własnym, długim hasłem',v:'t',why:'Obcy nie podłączą się do twojej sieci.'},
 {n:'Blokowanie telefonu, gdy odkładasz go na stolik',v:'t',why:'Nikt nie skorzysta z telefonu pod twoją nieobecność.'},
 {n:'Logowanie do banku przez sieć „Darmowe_WiFi_Dworzec”',v:'n',why:'Nie wiesz, kto stworzył tę sieć. Może być fałszywa.'},
 {n:'Płacenie po zeskanowaniu kodu QR z naklejki na parkometrze, bez sprawdzania adresu',v:'n',why:'Oszuści naklejają fałszywe kody na parkometry i ładowarki.'},
 {n:'Pożyczenie odblokowanego telefonu obcej osobie „na jeden telefon”',v:'n',why:'W kilka sekund można przelać pieniądze albo zainstalować aplikację.'},
 {n:'Router w domu z fabrycznym hasłem „admin”',v:'n',why:'Fabryczne hasła są znane i łatwe do znalezienia w internecie.'},
 {n:'Zostawienie odblokowanego laptopa w kawiarni „na chwilę”',v:'n',why:'Ktoś może skorzystać z twoich kont albo zabrać laptopa.'}
];

/* ---------- 15. Media społecznościowe ---------- */
const QSOC=[
 {mock:post('Wiadomość od znajomej','Czy to ty jesteś na tym filmie? 😮 film-zobacz.top/video'),q:'Co robisz?',o:['Nie klikam i pytam znajomą innym kanałem, czy to ona pisała','Klikam, żeby zobaczyć film','Loguję się na stronie, która się otworzy'],a:0,why:'To typowy sposób na przejęcie konta. Strona prosi o login i hasło, a potem oszust pisze do twoich znajomych.'},
 {mock:post('Facebook Support','Twoje konto zostanie usunięte za 24 godziny. Potwierdź dane logowania w formularzu.'),q:'Wiadomość przyszła na Messengerze. Co robisz?',o:['Ignoruję i zgłaszam wiadomość','Wypełniam formularz','Odpisuję i proszę o więcej czasu'],a:0,why:'Serwisy nie proszą o hasło w wiadomościach. „Support” to zwykłe, fałszywe konto.'},
 {mock:post('Konkurs','Gratulacje! Wygrałeś/aś telefon. Podaj dane karty, żeby zapłacić 9,99 zł za wysyłkę.'),q:'Nie brałaś ani nie brałeś udziału w konkursie. Co robisz?',o:['Nie podaję danych karty — to oszustwo','Płacę, bo to tylko 9,99 zł','Podaję tylko numer karty'],a:0,why:'Mała opłata za wysyłkę to przynęta. Celem są dane karty.'},
 {mock:post('Nowe zaproszenie do znajomych','Żołnierz na misji, samotny, chce poznać kogoś wyjątkowego. Profil założony tydzień temu.'),q:'Po kilku tygodniach rozmów ta osoba prosi o pieniądze na „bilet do Polski”. Co robisz?',o:['Nie wysyłam pieniędzy i kończę znajomość','Wysyłam, bo dobrze się rozmawia','Wysyłam połowę kwoty'],a:0,why:'To oszustwo „na miłość”. Oszuści miesiącami budują zaufanie, a potem proszą o pieniądze.'},
 {q:'Ktoś przejął twoje konto w mediach społecznościowych. Co robisz najpierw?',o:['Używam opcji odzyskiwania konta i zmieniam hasło, potem ostrzegam znajomych','Zakładam nowe konto i nic nie robię','Czekam, aż samo się naprawi'],a:0,why:'Szybkie odzyskanie konta ogranicza szkody. Znajomi powinni wiedzieć, żeby nie wysyłali pieniędzy „tobie”.'},
 {q:'Kto widzi twoje posty, jeśli ustawisz je jako „Publiczne”?',o:['Każdy, także osoby spoza znajomych','Tylko znajomi','Tylko rodzina'],a:0,why:'Ustawienie „Znajomi” ogranicza krąg osób, które widzą twoje posty.'}
];

/* ---------- 16. Dzieci w internecie ---------- */
const QKIDS=[
 {q:'Jak ograniczyć czas i aplikacje na telefonie dziecka?',o:['Kontrola rodzicielska: Family Link (Android) albo Czas przed ekranem (iPhone)','Zabrać telefon na zawsze','Nic się nie da zrobić'],a:0,why:'Te narzędzia są bezpłatne. Pozwalają ustawić limity czasu i zatwierdzać instalację aplikacji.'},
 {q:'Dziecko w grze kupuje dodatki za prawdziwe pieniądze. Jak temu zapobiec?',o:['Ustawić hasło lub zatwierdzanie przez rodzica przy zakupach w sklepie z aplikacjami','Podać dziecku dane swojej karty','Usunąć kartę z portfela'],a:0,why:'W sklepie z aplikacjami można wymagać hasła albo zgody rodzica przy każdym zakupie.'},
 {q:'Nieznajomy pisze do dziecka w grze i prosi o zdjęcia. Co robisz?',o:['Rozmawiam z dzieckiem, blokuję i zgłaszam konto, zachowuję dowody','Mówię dziecku, żeby odpisało grzecznie','Ignoruję, to tylko gra'],a:0,why:'To poważny sygnał zagrożenia. Zachowaj zrzuty ekranu, zgłoś konto w grze, a w razie zagrożenia dzwoń pod 112.'},
 {q:'Od ilu lat większość serwisów, np. Facebook, Instagram i TikTok, pozwala założyć konto?',o:['Od 13 lat','Od 6 lat','Bez ograniczeń'],a:0,why:'Takie są zasady tych serwisów. Wiele dzieci ma konta wcześniej, dlatego warto rozmawiać o bezpieczeństwie.'},
 {q:'Dziecko chce opublikować film z widocznym adresem domu. Co mówisz?',o:['Wyjaśniam, dlaczego lepiej nie pokazywać adresu, i pomagam nagrać film inaczej','Pozwalam, bo to tylko film','Zabraniam bez wyjaśnienia'],a:0,why:'Rozmowa uczy dziecko myśleć samodzielnie. Zakaz bez wyjaśnienia często nie działa.'},
 {q:'Co jest najważniejsze, gdy dziecko trafi w internecie na coś złego?',o:['Żeby nie bało się o tym powiedzieć dorosłemu','Żeby to ukryło','Żeby samo to rozwiązało'],a:0,why:'Dziecko, które nie boi się kary, szybciej powie o problemie.'}
];

/* ---------- 17. Bezpieczeństwo w pracy ---------- */
const QWORK=[
 {q:'Odchodzisz od komputera w pracy na kilka minut. Co robisz?',o:['Blokuję ekran skrótem Win + L','Zostawiam otwarty, bo zaraz wracam','Wyłączam monitor'],a:0,why:'Wyłączony monitor nie blokuje komputera. Win + L blokuje ekran w sekundę.'},
 {q:'Na parkingu firmy leży pendrive z napisem „Wypłaty 2026”. Co robisz?',o:['Oddaję go do działu IT, nie podłączam','Podłączam, żeby sprawdzić, czyj jest','Zabieram do domu'],a:0,why:'Znaleziony pendrive może zawierać złośliwy program. To znany sposób ataku na firmy.'},
 {q:'„Szef” pisze z prywatnego numeru: „Pilnie kup karty podarunkowe za 1000 zł, oddam jutro”. Co robisz?',o:['Dzwonię do szefa na znany numer albo pytam osobiście','Kupuję karty, bo to szef','Kupuję połowę'],a:0,why:'Karty podarunkowe to częsty sposób oszustów na zabranie pieniędzy. Zawsze sprawdź inną drogą.'},
 {q:'Gdzie trzymać hasło do komputera w pracy?',o:['W pamięci albo w menedżerze haseł wskazanym przez firmę','Na karteczce pod klawiaturą','W notatce na pulpicie'],a:0,why:'Karteczka i notatka na pulpicie to pierwsze miejsca, gdzie ktoś szuka hasła.'},
 {q:'Chcesz dokończyć pracę w domu. Czy możesz wysłać dane klientów na prywatny e-mail?',o:['Nie. Pracuję tylko na narzędziach, na które pozwala firma','Tak, jeśli nikt się nie dowie','Tak, jeśli usunę mail po pracy'],a:0,why:'Dane klientów wychodzą wtedy poza kontrolę firmy. To może naruszać przepisy o ochronie danych.'},
 {q:'Kliknięto link w podejrzanym mailu służbowym. Co robisz?',o:['Od razu zgłaszam to do IT lub przełożonego','Nic nie mówię, żeby nie było problemu','Usuwam maila i zapominam'],a:0,why:'Szybkie zgłoszenie pozwala ograniczyć szkody. Każdemu może się to zdarzyć.'}
];

/* ---------- 18. Test końcowy ---------- */
const QFINAL=[
 {q:'Które hasło jest najlepsze?',o:['Długie, z kilku losowych słów, inne w każdym serwisie','Imię i rok urodzenia','To samo hasło wszędzie, ale z wykrzyknikiem'],a:0,why:'Długość i niepowtarzalność są najważniejsze.'},
 {q:'Gdzie przekażesz podejrzany SMS?',o:['Na numer 8080','Na numer 112','Do nadawcy z prośbą o wyjaśnienie'],a:0,why:'8080 to usługa CERT Polska do zgłaszania podejrzanych SMS-ów. 112 służy do nagłych wypadków.'},
 {q:'Co oznacza kłódka obok adresu strony?',o:['Że połączenie jest szyfrowane','Że strona jest na pewno uczciwa','Że strona należy do banku'],a:0,why:'Fałszywe strony też mają kłódkę. Sprawdzaj adres.'},
 {q:'„Bank” dzwoni i prosi o przelew na bezpieczne konto. Co robisz?',o:['Rozłączam się i dzwonię na numer z karty','Robię przelew','Podaję tylko kod BLIK'],a:0,why:'Bank nigdy nie prosi o przelew na „bezpieczne konto”.'},
 {q:'Co trzeba zrobić, żeby odebrać przelew od kupującego?',o:['Podać numer konta','Podać dane karty i kod CVC','Zalogować się do banku przez link od kupującego'],a:0,why:'Do odebrania przelewu wystarczy numer konta.'},
 {q:'Co daje zastrzeżenie numeru PESEL?',o:['Utrudnia wzięcie kredytu na twoje dane','Blokuje twoje konto w banku','Ukrywa cię w internecie'],a:0,why:'Zastrzeżenie jest bezpłatne i można je cofnąć.'},
 {q:'Skąd instalować aplikacje na telefon?',o:['Tylko ze sklepu Google Play lub App Store','Z linków w SMS-ach','Ze stron, które polecają nieznajomi'],a:0,why:'Aplikacje spoza sklepu mogą przejąć telefon i bankowość.'},
 {q:'Podano dane karty na fałszywej stronie. Co najpierw?',o:['Dzwonię na infolinię banku','Czekam, czy coś zniknie z konta','Piszę do sklepu z prośbą o zwrot'],a:0,why:'Bank może zablokować kartę i czasem zatrzymać płatność. Liczy się czas.'}
];

/* ---------- lista ćwiczeń ---------- */
const ST=[
 {part:1,id:'hasla',n:'Hasła i logowanie',m:5,d:'Ocena haseł i reagowanie na podejrzane logowanie.',run:b=>quiz(b,'hasla',QPASS,{noShuffle:true,intro:'Hasła w tym ćwiczeniu to przykłady. Nigdy nie wpisuj swoich prawdziwych haseł na stronach z ćwiczeniami.'})},
 {part:1,id:'sms',n:'Fałszywe SMS-y',m:6,d:'Odróżnianie prawdziwych SMS-ów od oszustw.',run:b=>quiz(b,'sms',QSMS,{intro:'Wszystkie numery, firmy i adresy są wymyślone.'})},
 {part:1,id:'mail',n:'Fałszywy e-mail',m:6,d:'Szukanie sygnałów ostrzegawczych w wiadomości.',run:b=>hotTask(b,'mail',{lead:'Ten e-mail udaje wiadomość od firmy kurierskiej.',label:'Wiadomość e-mail',parts:MAIL,doc:true,words:['sygnał ostrzegawczy','sygnały ostrzegawcze','sygnałów ostrzegawczych'],action:'Kliknij fragmenty, które są podejrzane.',found:'Znalezione sygnały',endMsg:'Najważniejsze sygnały: dziwny adres nadawcy, presja czasu i link do płatności.'})},
 {part:1,id:'adresy',n:'Czytanie adresów stron',m:5,d:'Prawdziwa strona banku czy podróbka?',run:b=>quiz(b,'adresy',QURL,{noShuffle:true,intro:'Twój bank w tym ćwiczeniu to fikcyjny MójBank, adres mojbank.pl. Czytaj adres od prawej: liczy się końcówka przed pierwszym „/”.'})},
 {part:1,id:'telefon',n:'Bezpieczny telefon',m:5,d:'Bezpieczne i ryzykowne ustawienia telefonu.',run:b=>sortTask(b,'telefon',PHONE,[['t','Bezpieczne'],['n','Ryzykowne']],'Które ustawienia i nawyki chronią telefon, a które są ryzykowne?','Blokada ekranu, aktualizacje i aplikacje tylko ze sklepu to podstawa.')},
 {part:1,id:'rozmowy',n:'Telefony od oszustów',m:6,d:'„Bank”, „policja”, „córka” i „urząd” dzwonią.',run:b=>quiz(b,'rozmowy',QCALL,{intro:'Zasada na wszystkie sytuacje: rozłącz się i zadzwoń sam na numer, który znasz.'})},
 {part:1,id:'pieniadze',n:'Pieniądze w internecie',m:7,d:'BLIK, portale ogłoszeniowe, sklepy i zbiórki.',run:b=>quiz(b,'pieniadze',QMONEY)},
 {part:1,id:'prywatnosc',n:'Co można opublikować?',m:5,d:'Prywatność w mediach społecznościowych.',run:b=>sortTask(b,'prywatnosc',POSTS,[['t','Można opublikować'],['n','Lepiej nie']],'Co możesz spokojnie opublikować w mediach społecznościowych, a czego lepiej nie?','Zanim coś opublikujesz, zapytaj siebie: czy obca osoba może to wykorzystać?')},
 {part:1,id:'reakcja',n:'Co zrobić, gdy coś się stanie',m:5,d:'Właściwa reakcja w różnych sytuacjach.',run:b=>quiz(b,'reakcja',poolQuiz(PQ,PLACES))},
 {part:2,id:'sklep',n:'Fałszywy sklep internetowy',m:6,d:'Szukanie sygnałów ostrzegawczych na stronie sklepu.',run:b=>hotTask(b,'sklep',{lead:'Ta strona udaje sklep z telefonami.',label:'Strona sklepu',parts:SHOP,doc:true,words:['sygnał ostrzegawczy','sygnały ostrzegawcze','sygnałów ostrzegawczych'],action:'Kliknij fragmenty, które są podejrzane.',found:'Znalezione sygnały',endMsg:'Zanim zapłacisz, sprawdź cenę, dane firmy i formę płatności.'})},
 {part:2,id:'kupujacy',n:'„Kupujący” na portalu ogłoszeniowym',m:6,d:'Rozmowa z oszustem, który udaje kupującego.',run:b=>hotTask(b,'kupujacy',{lead:'Sprzedajesz kurtkę na portalu ogłoszeniowym. Tak wygląda rozmowa z „kupującym”.',label:'Rozmowa na portalu',parts:BUYER,doc:true,words:['sygnał ostrzegawczy','sygnały ostrzegawcze','sygnałów ostrzegawczych'],action:'Kliknij fragmenty, które są podejrzane.',found:'Znalezione sygnały',endMsg:'Do odebrania pieniędzy wystarczy numer konta. Nigdy nie podawaj danych karty.'})},
 {part:2,id:'2fa',n:'Włączanie logowania dwuetapowego',m:5,d:'Kolejność kroków na koncie pocztowym.',run:b=>orderTask(b,'2fa',{lead:'Ułóż kroki włączania logowania dwuetapowego w dobrej kolejności.',steps:STEPS2FA,endMsg:'Po ćwiczeniu włącz logowanie dwuetapowe na swojej poczcie naprawdę.'})},
 {part:2,id:'uprawnienia',n:'Uprawnienia aplikacji',m:5,d:'Kiedy zezwolić aplikacji na dostęp, a kiedy nie.',run:b=>quiz(b,'uprawnienia',QPERM,{intro:'Aplikacja powinna dostać tylko to, czego naprawdę potrzebuje do działania.'})},
 {part:2,id:'sieci',n:'Poza domem: Wi-Fi, QR i telefon',m:5,d:'Bezpieczne i ryzykowne nawyki poza domem.',run:b=>sortTask(b,'sieci',NETS,[['t','Bezpieczne'],['n','Ryzykowne']],'Które nawyki są bezpieczne, a które ryzykowne?','Poza domem używaj własnego internetu, sprawdzaj kody QR i nie zostawiaj odblokowanych urządzeń.')},
 {part:2,id:'social',n:'Media społecznościowe',m:6,d:'Przejęte konta, fałszywe konkursy i oszustwa „na miłość”.',run:b=>quiz(b,'social',QSOC,{intro:'Wszystkie wiadomości i profile są wymyślone.'})},
 {part:2,id:'dzieci',n:'Dzieci w internecie',m:6,d:'Kontrola rodzicielska, zakupy w grach i rozmowa z dzieckiem.',run:b=>quiz(b,'dzieci',QKIDS)},
 {part:2,id:'praca',n:'Bezpieczeństwo w pracy',m:5,d:'Komputer, pendrive, „szef” i dane klientów.',run:b=>quiz(b,'praca',QWORK)},
 {part:2,id:'test',n:'Test końcowy',m:6,d:'Powtórka najważniejszych zasad z całego modułu.',run:b=>quiz(b,'test',QFINAL)}
];

function nextId(id){const k=ST.findIndex(s=>s.id===id); return ST[k+1]?ST[k+1].id:null}
function totals(){const v=Object.values(state.best); return {pts:v.reduce((a,b)=>a+b,0), n:v.length}}
function renderNav(){
  const ul=$('#navlist'); ul.innerHTML='';
  ST.forEach((s,k)=>{const sc=state.best[s.id];
    if(k===0||ST[k-1].part!==s.part) ul.append(h(`<li class="navhead">Część ${s.part}: ${PARTS[s.part]}</li>`));
    const li=h(`<li><button class="nav" data-id="${s.id}"><span class="n">${k+1}. ${s.n}</span><span class="m">ok. ${s.m} min</span><span class="s${sc!=null?' done':''}">${sc!=null?sc+' / 25':'—'}</span></button></li>`);
    const b=li.querySelector('button'); if(current===s.id) b.setAttribute('aria-current','true'); b.onclick=()=>openStation(s.id); ul.append(li)});
  [['intro','#nav-intro'],['lib','#nav-lib'],['sum','#nav-sum']].forEach(([k,sel])=>{const b=$(sel); if(current===k) b.setAttribute('aria-current','true'); else b.removeAttribute('aria-current')});
  $('#lib-count').textContent=`${Object.keys(state.tried).length} z ${LIB.length}`;
  const t=totals(); $('#pts').textContent=`${t.pts} / ${ST.length*25} pkt`; $('#cnt').textContent=`${t.n} z ${ST.length} ćwiczeń`; $('#barfill').style.width=(t.pts/(ST.length*25)*100)+'%';
}
function setPanel(id){if(cleanup){cleanup();cleanup=null} current=id; renderNav(); const p=$('#panel'); p.innerHTML=''; return p}
function focusPanel(){const p=$('#panel'); const t=p.querySelector('h2'); if(t){t.setAttribute('tabindex','-1'); t.focus({preventScroll:true})} if(window.innerWidth<=860) p.scrollIntoView({block:'start'})}
function openStation(id){
  const s=ST.find(x=>x.id===id); const p=setPanel(id);
  p.append(h(`<h2>${s.n}</h2>`)); p.append(h(`<p class="desc">${s.d} Czas: ok. ${s.m} min. Najwyżej 25 pkt.</p>`));
  const body=h('<div></div>'); p.append(body); s.run(body); focusPanel();
}
function showIntro(){
  const p=setPanel('intro');
  p.innerHTML=`<h2>Wprowadzenie</h2>
  <p class="desc">Osiemnaście ćwiczeń z podstaw bezpieczeństwa w internecie w dwóch częściach. Każda część trwa około godziny.</p>
  <p><b>Część 1: Podstawy</b> — hasła, SMS-y, e-maile, adresy stron, telefon, telefony od oszustów, pieniądze, prywatność i reagowanie.<br><b>Część 2: Codzienne sytuacje</b> — fałszywe sklepy, „kupujący” na portalach, logowanie dwuetapowe, uprawnienia aplikacji, Wi-Fi i kody QR, media społecznościowe, dzieci w internecie, bezpieczeństwo w pracy i test końcowy.</p>
  <p>Ćwiczenia możesz robić w dowolnej kolejności i powtarzać. Za każde ćwiczenie możesz dostać do 25 punktów, razem 450. Wyniki zapisują się w tej przeglądarce.</p>
  <p>Po ćwiczeniach przejdź do części <b>Zrób to dziś</b>. To lista ustawień do zrobienia na twoim telefonie i kontach, krok po kroku.</p>
  <p>Wszystkie firmy, numery, adresy i wiadomości w ćwiczeniach są wymyślone. Nic nie jest wysyłane.</p>
  <div class="row"><button class="btn" id="go">Zacznij pierwsze ćwiczenie</button><button class="btn alt" id="golib">Zrób to dziś</button></div>
  <details><summary>Informacje dla prowadzącego</summary><ol>
    <li>Część 1 (ok. 60 min): ćwiczenia 1, 4 i 5 po blokach o hasłach i telefonie; 2, 3 i 6 po bloku o oszustwach; 7–9 na koniec.</li>
    <li>Część 2 (ok. 50 min): najlepiej na osobnych zajęciach albo jako praca domowa. Ćwiczenie 16 (dzieci) warto omówić z rodzicami w grupie.</li>
    <li>Ćwiczenie 18 (test końcowy) sprawdza najważniejsze zasady z całego modułu.</li>
    <li>Zrób to dziś (ok. 20–30 min): praca na własnym telefonie. Każda osoba wybiera co najmniej 3 rzeczy.</li>
  </ol></details>`;
  p.querySelector('#go').onclick=()=>openStation(ST[0].id); p.querySelector('#golib').onclick=()=>showLibrary(); focusPanel();
}

function showSummary(){
  const p=setPanel('sum'); const t=totals();
  const rows=ST.map((s,k)=>`${k===0||ST[k-1].part!==s.part?`<tr class="sumhead"><td colspan="2">Część ${s.part}: ${PARTS[s.part]}</td></tr>`:''}<tr><td>${k+1}. ${s.n}</td><td>${state.best[s.id]!=null?state.best[s.id]+' / 25':'nie wykonano'}</td></tr>`).join('');
  p.innerHTML=`<h2>Podsumowanie wyników</h2><p class="desc">Wykonane ćwiczenia: ${t.n} z ${ST.length}. Liczy się najlepszy wynik z każdego ćwiczenia. Zrobione z listy „Zrób to dziś”: ${Object.keys(state.tried).length} z ${LIB.length}.</p>
  <table class="sum"><thead><tr><th>Ćwiczenie</th><th>Wynik</th></tr></thead><tbody>${rows}</tbody><tfoot><tr><td>Razem</td><td>${t.pts} / ${ST.length*25}</td></tr></tfoot></table>
  <div class="row"><button class="btn alt" id="reset">Wyczyść wyniki</button></div>`;
  let armed=false; const r=p.querySelector('#reset');
  r.onclick=()=>{if(!armed){armed=true; r.textContent='Kliknij jeszcze raz, aby potwierdzić'; setTimeout(()=>{armed=false; r.textContent='Wyczyść wyniki'},4000); return}
    state.best={}; state.tried={}; save(); showSummary()};
  focusPanel();
}
$('#nav-intro').onclick=showIntro; $('#nav-lib').onclick=()=>showLibrary(); $('#nav-sum').onclick=showSummary;
showIntro();
