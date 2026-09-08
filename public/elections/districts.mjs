// Transcribed from the National Election Office's two-page electoral division list.
// Preserve the source's names and groupings, including both Falalop entries in Yap.
export const DISTRICT_SOURCE = 'https://www.fsmned.fm/PDF/new_electoral_divisions_%20by_state.pdf';
export const DISTRICTS = {
  Chuuk: [
    ['Ettal', 'Lekinioch', 'Kuttu', 'Losap', 'Moch', 'Nama', 'Namoluk', 'Oneop', 'Piisemwar', 'Satowan', 'Ta'],
    ['Fonoton', 'Piis Paneu', 'Weno'],
    ['Fefan', 'Parem', 'Siis', 'Tonoas', 'Uman'],
    ['Eot', 'Fanapangas', 'Onei', 'Paata', 'Polle', 'Romanum', 'Tolensom', 'Udot'],
    ['Fananu', 'Houk', 'Makur', 'Murilo', 'Nomwin', 'Onou', 'Onoun', 'Piharah', 'Pollap', 'Polowat', 'Ruo', 'Tamatam', 'Unanu'],
  ],
  Kosrae: [['Lelu Proper', 'Lelu Wan', 'Malem', 'Tafunsak', 'Walung', 'Utwe']],
  Pohnpei: [
    ['Kolonia', 'Sokehs', 'Sapwuafik', 'Kapinga', 'Nukuoro'],
    ['Kitti', 'Madolenihmw'],
    ['Nett', 'Uh', 'Mokil', 'Pingelap'],
  ],
  Yap: [
    ['Rumung', 'Maap', 'Gagil', 'Tomil', 'Fanif', 'Weloy', 'Delipebinaw', 'Rull', 'Kanifay', 'Gilman'],
    ['Asor', 'Fais', 'Falalop', 'Ulithi', 'Fethray', 'Mogmog', 'Ngulu', 'Sorol'],
    ['Falalop', 'Woleai', 'Falalus', 'Seliap', 'Tegailap', 'Wottegai'],
    ['Euripik', 'Faraulap', 'Ifalik', 'Piig'],
    ['Elato', 'Lamotrek', 'Satowal'],
  ],
};

export function districtChoices(state) {
  return (Object.hasOwn(DISTRICTS, state) ? DISTRICTS[state] : []).flatMap((places, index) =>
    places.map(place => ({ value: `${index + 1}:${place}`, ed: String(index + 1), place })));
}

export function districtForChoice(state, choice) {
  return districtChoices(state).find(item => item.value === choice)?.ed || '';
}

export function validDistrict(state, ed) {
  return districtChoices(state).some(item => item.ed === String(ed));
}
