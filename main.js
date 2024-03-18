const TelegramBot = require("node-telegram-bot-api");
const axios = require('axios'); // Import modul Axios untuk melakukan permintaan HTTP

const token = "[masukan token api telegram anda";
const options = {
  polling: true,
};
const cuybot = new TelegramBot(token, options);

const prefix = ".";
const sayHi = new RegExp(`^${prefix}hai$`);
const gempa = new RegExp(`^${prefix}gempa$`);
const waktuSholat = new RegExp(`^${prefix}waktuSholat`);
const tanggal = new RegExp(`^${prefix}cekTanggal$`)
const imdb = new RegExp(`^${prefix}cariFilm`);


//sayhi
cuybot.onText(sayHi, (callback) => {
  cuybot.sendMessage(callback.from.id, "hai juga");
});

//gempa
cuybot.onText(gempa, async (callback) => {
  const BMKG_ENDPOINT = "https://data.bmkg.go.id/DataMKG/TEWS/";

  const apiCall = await axios.get(BMKG_ENDPOINT + "autogempa.json");
  const {
    Infogempa: {
      gempa: {
        Jam,
        Magnitude,
        Tanggal,
        Wilayah,
        Potensi,
        Kedalaman,
        Shakemap,
        Coordinates,
        Lintang,
      },
    },
  } = apiCall.data
  const BMKGImage = BMKG_ENDPOINT + Shakemap;
  const resultText = `Waktu:${Tanggal} | ${Jam}
Besaran:${Magnitude} | SR
Wilayah:${Wilayah}
Potensi:${Potensi}
Kedalaman:${Kedalaman}
 Lintang:${Lintang}
Koordinat:${Coordinates}`;

  cuybot.sendPhoto(callback.from.id, BMKGImage, { caption: resultText });
});

//WaktuSholat
cuybot.onText(waktuSholat, async (msg) => {
  const date = new Date(); // ambil tanggal saat ini
  const formattedDate = `${date.getFullYear()}-${("0" + (date.getMonth() + 1)).slice(-2)}-${("0" + date.getDate()).slice(-2)}`;
  const WaktuIni = `https://api.myquran.com/v2/sholat/jadwal/1210/${formattedDate}`;

  try {
    const apiCall = await axios.get(WaktuIni);
    const { lokasi, daerah, jadwal } = apiCall.data.data;
    const resultText = `Jadwal Sholat untuk ${lokasi}, ${daerah} (${jadwal.tanggal}):
Subuh: ${jadwal.subuh}
Dzuhur: ${jadwal.dzuhur}
Ashar: ${jadwal.ashar}
Maghrib: ${jadwal.maghrib}
Isya: ${jadwal.isya}`;

    cuybot.sendMessage(msg.chat.id, resultText);
  } catch (error) {
    console.error("Error fetching prayer time data:", error);
    cuybot.sendMessage(msg.chat.id, "Maaf, terjadi kesalahan saat mengambil jadwal sholat.");
  }
});



//tanggal hijriah
cuybot.onText(tanggal, async (msg) => {
  try {
    const WaktuIni = "https://api.myquran.com/v2/cal/hijr/";
    const apiCall = await axios.get(WaktuIni);
    const kalender = await apiCall.data
    const tanggalHijriyah = kalender.data.date;
      const resultText = `Tanggal pada hari ini dalam kalender Hijriyah adalah:
     ${tanggalHijriyah}`;

    cuybot.sendMessage(msg.chat.id, resultText);
  } catch (error) {
    console.error("Error fetching Hijri date:", error);
    cuybot.sendMessage(
      msg.chat.id,
      "Maaf, terjadi kesalahan saat mengambil tanggal dalam kalender Hijriyah."
    );
  }
});

// imd cari film 
cuybot.onText(imdb, async (msg) => {
  try {
    const movieName = msg.text.replace(imdb, "").trim();
    const apiKey = "[masukan toke imdb anda]";
    const apiUrl = `http://www.omdbapi.com/?s=${movieName}&apikey=${apiKey}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.Response === "True") {
      const movies = data.Search; // Mengambil array film dari hasil pencarian

      // Loop melalui setiap film dan kirim foto beserta informasi teks
      for (const movie of movies) {
        const { Title, Year, Poster } = movie;
        const resultText = `
          Title: ${Title}
          Year: ${Year}
          IMDb ID: ${movie.imdbID}
        `;

        // Mengirim foto beserta caption
        cuybot.sendPhoto(msg.chat.id, Poster, { caption: resultText });
      }
    } else {
      cuybot.sendMessage(msg.chat.id, "Film tidak ditemukan.");
    }
  } catch (error) {
    console.error("Error fetching movie data:", error);
    cuybot.sendMessage(msg.chat.id, "Maaf, terjadi kesalahan saat mencari informasi film.");
  }
});
