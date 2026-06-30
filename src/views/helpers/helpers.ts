export interface Prof {
    nome: string;
    sala: number;
}

export interface Technology {
    name: string;
    type: string;
    poweredByNodejs: boolean;
}

function listProfs(profs: Prof[]) {
    const list = profs.map(p => `<li>${p.nome} - ${p.sala}</li>`).join('');
    return `<ul>${list}</ul>`;
}

function listNodeTechs(techs: Technology[]) {
    const filtered = techs.filter(t => t.poweredByNodejs);
    const list = filtered.map(t => `<li>${t.name} - ${t.type}</li>`).join('');
    return `<ul>${list}</ul>`;
}

function formatDate(date: Date | string) {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

function eq(a: unknown, b: unknown) {
    return a === b;
}

export default {
    listProfs,
    listNodeTechs,
    formatDate,
    eq,
};