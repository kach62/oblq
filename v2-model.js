(function(root){
const positions={
 'ref-0':[.48,.58,'Une expression de marque distincte dans des codes sportifs connus. La cohérence du système est documentée ; son effet sur la réception reste à mesurer.'],
 'ref-1':[.40,.38,'Un langage d’auteur singulier. Une force culturelle et expressive, sans preuve d’un changement généralisé de pratique.'],
 'ref-2':[.78,.64,'Le mouvement remplace l’écran comme langage d’interface. Le dispositif est documenté ; la compréhension des gestes reste à tester.'],
 'ref-3':[.38,.73,'La provenance déplace les critères de crédibilité. Une enquête située soutient le signal, sans établir sa généralisation à tous les publics.'],
 'ref-4':[.28,.37,'La porosité entre disciplines est connue. Cette exposition renouvelle sa lecture, sans démontrer une nouvelle bascule culturelle.'],
 'ref-5':[.34,.50,'Une plateforme IA adopte des codes B2B plus matures. Le déplacement porte sur les publics et la stratégie, plutôt que sur une rupture formelle.'],
 'ref-6':[.42,.35,'La pluralité des auteurs élargit le casting créatif. Une sélection éditoriale ne suffit pas à établir une tendance de génération.'],
 'ref-7':[.76,.70,'La donnée environnementale modifie réellement le jeu. Le lien entre mesure et expérience est documenté ; ses effets éducatifs restent à établir.'],
 'ref-8':[.24,.65,'Un comportement de consommation déjà connu questionne la valeur des actifs distinctifs. Son ampleur et ses effets restent à contextualiser.'],
 'ref-9':[.68,.45,'Pensée bouddhiste, matière et numérique changent l’angle de lecture de l’IA. Le déplacement reste artistique, sans preuve de conscience machine.'],
 'ref-10':[.42,.54,'Deux lieux sont articulés par leur fonctionnement. La relation création/diffusion donne une raison au système, sans constituer une rupture de catégorie.'],
 'ref-11':[.28,.51,'Le temps passé avec les sujets donne une origine à l’image. La méthode est établie ; sa pertinence augmente dans une culture d’images rapides.'],
 'ref-12':[.81,.61,'La co-création 3D devient une logique que le designer peut orienter. Le prototype ouvre une méthode ; sa diffusion dans les métiers reste à vérifier.'],
 'ref-13':[.32,.66,'Le geste et les imperfections retrouvent une valeur de provenance. Le cadre WGSN éclaire le signal, sans garantir sa durée.'],
 'ref-14':[.39,.42,'Une série photographique historique déplace la perception du réel. Cette relecture ne prouve pas une mutation récente des usages.'],
 'ref-15':[.61,.62,'Une règle musicale organise les variations d’identité. Le système génératif dépasse le logo ; sa portée métier reste une interprétation OBLQ.'],
 'ref-16':[.43,.52,'L’identité intègre des enfants non lecteurs. Le déplacement concerne l’usage et la compréhension, avec des codes de design déjà établis.'],
 'ref-18':[.31,.60,'La fabrication visible devient un indice de valeur. L’accès partiel à la source limite la confiance dans la portée de ce signal.'],
 'ref-19':[.45,.47,'Un geste artistique rend une tension contemporaine visible dans un lieu patrimonial. L’impact public de l’intervention n’est pas mesuré.'],
 'ref-20':[.36,.43,'La contrainte architecturale nourrit le geste. Une relation au lieu documentée, sans rupture générale démontrée.'],
 'ref-21':[.57,.56,'L’architecture optique devient le langage de l’objet. Le design relie technique et reconnaissance ; la performance scientifique exige d’autres preuves.'],
 'xsolla-2026':[.62,.62,'Une métaphore d’inventaire organise identité et interfaces. La règle peut accompagner l’usage ; son efficacité commerciale n’est pas démontrée.'],
 'youme-kyoto-pentagram-2026':[.65,.59,'Le signe devient une règle de construction et une présence physique. Le système est décrit par le studio ; sa compréhension publique reste à vérifier.'],
 'orchid-love-and-money-2026':[.60,.66,'Le caractère de marque rejoint l’action dans 128 pixels. Le lien identité/produit est documenté ; les résultats revendiqués ne sont pas une mesure indépendante.'],
 'tobie-tse-textile-motion-2026':[.54,.56,'Le textile fabriqué devient le point de départ du mouvement. Un processus identifiable, sans preuve que la technique change tous les workflows.'],
 'wpp-devons-point-20260923':[.47,.76,'La production hybride est matérialisée dans une infrastructure commune. L’organisation change ; les gains annoncés restent des promesses à vérifier.'],
 'koto-stereo-20260909':[.42,.70,'L’intégration branding/campagne s’étend aux studios. L’acquisition est documentée ; les synergies et la singularité du craft restent à observer.']
};
const links={
'youme-kyoto-pentagram-2026':[['ref-10','De Sada + Mada à YouMe : la relation entre lieux ou disciplines devient la règle de l’identité.'],['ref-15','De Bijloke fait varier une règle musicale ; YouMe la fait passer d’un signe à une construction.']],
'orchid-love-and-money-2026':[['ref-21','Living Optics part de la contrainte optique ; Orchid part du petit écran. Dans les deux cas, le produit donne une raison à la forme.'],['ref-5','AutogenAI organise l’identité par les besoins des publics ; Orchid l’éprouve dans les actions de l’utilisateur.']],
'tobie-tse-textile-motion-2026':[['ref-18','Effort Signaling pose la question du geste visible ; Tobie Tse donne un exemple concret de sa continuité dans le mouvement.'],['ref-13','Renaissance of Real décrit une recherche de provenance. Le textile fabriqué rend ici cette origine perceptible.']],
'wpp-devons-point-20260923':[['ref-12','LUCID questionne les règles de co-création. WPP transpose la question à l’organisation de la production : qui dirige, valide et conserve le contexte ?']],
'koto-stereo-20260909':[['xsolla-2026','Xsolla relie identité et interfaces ; Koto × Stereo interroge les compétences nécessaires pour accompagner la marque au-delà du lancement.']],
'ref-2':[['ref-12','LUCID et Furny déplacent l’interface : une logique orientable dans le premier cas, un comportement physique dans le second. La compréhension de l’utilisateur reste le test.']],
'ref-0':[['ref-15','De Bijloke fait de la musique une règle de variation. Formula E cherche la même continuité entre signe, typographie et mouvement, dans un autre univers.']],
'ref-3':[['ref-13','Renaissance of Real rend la provenance perceptible ; The Trust Shift interroge sa valeur dans la confiance envers les contenus.']],
'ref-7':[['ref-15','De Bijloke génère des variations visuelles ; BlockSmog fait dépendre l’expérience d’une variable du monde réel.']],
'xsolla-2026':[['ref-5','Deux services technologiques rendent leur offre compréhensible par un système de marque. Xsolla ajoute une métaphore fonctionnelle issue du jeu.']]
};
const date=r=>/^\d{4}-\d{2}-\d{2}$/.test(r.date||'')?r.date:/^\d{2}$/.test(r.day||'')?`2026-10-${r.day}`:null;
function map(r){if(r.map&&Number.isFinite(r.map.x)&&Number.isFinite(r.map.y)&&r.map.rationale)return r.map;const p=positions[r.id];return p?{x:p[0],y:p[1],rationale:p[2],date:'2026-10-07',status:'Lecture éditoriale initiale',history:[]}:{x:null,y:null,rationale:'La source détaillée manque encore. OBLQ suspend le positionnement plutôt que de lui donner une précision artificielle.',history:[]}}
function connections(r,all){if(!r.connections&&links[r.id])return links[r.id].map(([id,reason])=>({ref:all.find(a=>a.id===id),reason,status:"Lecture croisée OBLQ"})).filter(c=>c.ref&&date(c.ref)&&date(r)&&date(c.ref)<date(r));if(Array.isArray(r.connections))return r.connections.map(c=>({ref:all.find(a=>a.id===c.id),reason:c.reason||'Connexion éditoriale documentée',status:'Connexion éditoriale'})).filter(c=>c.ref&&date(c.ref)&&date(r)&&date(c.ref)<date(r));return all.filter(a=>a.id!==r.id&&date(a)&&date(r)&&date(a)<date(r)&&a.doctrine===r.doctrine).sort((a,b)=>date(b).localeCompare(date(a))).slice(0,3).map(a=>({ref:a,reason:'Même principe créatif : mettre en regard les méthodes, leurs contextes et leurs limites.',status:'Rapprochement proposé'}))}
function remember(previous,incoming){const byId=new Map((previous||[]).map(r=>[r.id,r]));for(const r of incoming){const old=byId.get(r.id),merged={...old,...r};if(old?.map&&!r.map)merged.map=old.map;if(old?.connections&&!r.connections)merged.connections=old.connections;const versions=old?.versions?.slice()||[];if(old){const before={...old},after={...merged};delete before.versions;delete after.versions;if(JSON.stringify(before)!==JSON.stringify(after))versions.push(before)}byId.set(r.id,{...merged,versions})}return [...byId.values()]}

root.OBLQModel={map,connections,remember,date};if(typeof module!=='undefined')module.exports=root.OBLQModel;
})(typeof globalThis!=='undefined'?globalThis:this);
