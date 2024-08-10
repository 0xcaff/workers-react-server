type Song = {
  title: string;
  duration: string;
};

type Album = {
  id: string;
  artist: string;
  title: string;
  cover: string;
  songs: Song[];
};

const albums: Album[] = [
  {
    artist: "abc",
    cover: "abc",
    id: "a",
    songs: [],
    title: "hello",
  },
];

const artificialWait = (ms = 1500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/** @returns {Promise<Album[]>} */
export async function getAll() {
  await artificialWait();
  return albums;
}

/** @returns {Promise<Album | undefined>} */
export async function getById(id: string) {
  await artificialWait();
  return albums.find((album) => album.id === id);
}
