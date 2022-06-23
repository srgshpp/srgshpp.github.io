const fs = require('fs');

const makeId = (name) => name.split(' ').join('-');

const createLinkPerson = (p) => `<div><a class="person continue-reading" href="#${makeId(p)}">${p}</a></div>`;

const createNameFile = (index) => {
    const inStr = `${index}`;
    let r = inStr;
    switch (inStr.length) {
        case 1:
            r = `00${inStr}`;
            break;
        case 2:
            r = `0${inStr}`;
            break;
        default:
            r = inStr;
    }
    return r;
};

module.exports.build = () => {
    delete require.cache[require.resolve('./data')];
    const {people, families} = require('./data');
    const persons = [];
    const getSiblingsIds = (family, exept = '') => {
        if (family && family.children) {
            return family.children.filter(child => child !== exept)
        } else {
          return [];
        }
    }
    const getChildrenIds = (familiesIdsArr) =>
        familiesIdsArr.reduce((children, family) =>
            [...children, ...family.children], []);

    const getPartnersId = (familiesIdsArr, exept = '') =>
        familiesIdsArr.reduce((partnersId, family) => {
            if (!family) {
                debugger
            }
            const patnerId = family.husb === exept ? family.wife : family.husb;
            if (patnerId) {
                return [...partnersId, patnerId];
            } else {
                return partnersId;
            }

        }, []);
    let index = 0;
    const allArticles = [];
    for (const personId in people) {
        const { name, born, died, description, kinship = '', birthSurname, famasc, famass } = people[personId];
        if (name === 'Новиков Михаил Яковлевич') {
            debugger
        }
        const familyAsASposeArr = famass.map(f => families[f]).filter(d=>d) || [];
        const familyAsAChild = families[famasc] || {};

        const parents = {
            father: familyAsAChild.husb ? people[familyAsAChild.husb].name : '',
            mother: familyAsAChild.wife ? people[familyAsAChild.wife].name : ''
        };

        const husb_famass = familyAsAChild.husb ? people[familyAsAChild.husb].famass : [];
        const wife_famass = familyAsAChild.wife ? people[familyAsAChild.wife].famass : [];
        const f1 = husb_famass.filter(i => !wife_famass.some(q => q === i));
        const common_famass = [];


        [...husb_famass, ...wife_famass].forEach(fam => {
           if (!common_famass.includes(fam)) {
               common_famass.push(fam)
           }
        });

        const siblingsIds = common_famass.reduce((curr, id) => families[id] && families[id].children ? curr.concat(families[id].children.filter(f => f !== personId)) : curr, []);
        // const siblingsIds = getSiblingsIds(familyAsAChild, personId);
        const partnerIds = getPartnersId(familyAsASposeArr, personId);
        const childrenIdArr = getChildrenIds(familyAsASposeArr, personId);

        const siblings = siblingsIds.map(id => people[id] ? people[id].name : 'no name');
        const children = childrenIdArr.map(id => people[id] ? people[id].name : 'no name');
        const partner = partnerIds.map(id => {
            if (!people[id]) {
                debugger
            }
            return people[id].name;
        });

        const fileName = `_includes/persons/${createNameFile(index++)}.html`;
        const tmpl = `
<article id="${makeId(name)}">
    <h3 class="person-title-name">
        ${birthSurname ? `(${birthSurname})` : ''} ${name}${kinship ? ',' : ''}
    </h3>

    ${kinship ?`<span class="kinship value">${kinship}</span>` : ''}

    ${born && (born.date || born.place)
            ? `<p class="born">род. ${born.date
                ? `${born.date}, `
                : ''}${born.place
                ? born.place
                : ''}</p>`
            : ''}
    
    ${died && (died.date || died.place) ? `<p class="died">ум. ${died.date ? `${died.date}, ` : ''}${died.place ? died.place : ''}</p>` : ''}

    <p>
        ${description.trim().split('\n\n').join('<br>')}
    </p>
    
    <div class="relatives">
        <div class="row persons-box">
            ${(parents.father || parents.mother)
            ? `<div class="parents persons-box"><div>Родители:</div>
                    ${parents.father ? `<div><span>Отец: </span><a class="person continue-reading" href="#${makeId(parents.father)}">${parents.father}</a></div>` : ''}
                    ${parents.mother ? `<div><span>Мать: </span><a class="person continue-reading" href="#${makeId(parents.mother)}">${parents.mother}</a></div>` : ''}</div>`
            : ''}
        
            ${partner && partner.length && partner[0]
            ? `<div class="spause persons-box">Супруг(а): ${partner.map(p => `<div><a class="person continue-reading" href="#${makeId(p)}">${p}</a></div>`).join('')}</div>`
            : '' }
        </div>
        <!--<div class="row">-->
            ${ siblings && siblings.length && siblings[0]
            ? `<div class="siblings persons-box">
                        <div>Братья и сестры:</div>
                        ${siblings.map(createLinkPerson).join('')}
                   </div>`
            : '' }
            ${ children && children.length && children[0]
            ?   `<div class="children persons-box">
                        <div>Дети:</div>
                        ${children.map(createLinkPerson).join('')}
                    </div>`
            : '' }
        <!--</div>-->
    </div>
</article>        
        `;
        allArticles.push(tmpl);


    }

    fs.writeFile(`_includes/persons/people.html`, allArticles.join(''), { encoding: 'utf8', flag: 'w' }, function (err) {
        if (err) throw err;
    });
};