# AI Mystery Room

Interactive, AI-generated detective investigations built with React, Express, MongoDB, and Gemini.

## Run locally

1. Copy `server/.env.example` to `server/.env` and supply MongoDB, JWT, and Gemini credentials.
2. Run `npm install` in the repository root, then `npm run install:all`.
3. Run `npm run dev` and open the Vite URL (normally `http://localhost:5173`).

Gemini generation is intentionally server-only. A valid `GEMINI_API_KEY` and MongoDB connection are required to generate cases. Case generation saves the playable investigation first; selected media is then generated in background jobs, so a slow video does not block the case. Pending jobs resume when the server restarts.

## Generated image and audio evidence

To attach generated media to cases, configure Cloudinary in `server/.env`. Add either `CLOUDINARY_URL` from your Cloudinary dashboard or the `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` values. The secret must stay on the server. The case setup page has independent image, audio, and video toggles. The backend uses Gemini image and text-to-speech models and Veo video generation, then stores selected media in Cloudinary. Video generation can take several minutes and consume additional API quota. Model names and voice can be changed with the `GEMINI_IMAGE_MODEL`, `GEMINI_TTS_MODEL`, `GEMINI_TTS_VOICE`, and `GEMINI_VIDEO_MODEL` variables. Restart the backend after editing `.env`.

If Cloudinary is not configured, the investigation still generates with written clues and the setup panel reports the missing provider. The evidence board lets each investigator bookmark clues and privately link them to suspects. Generated image, audio, and video clues must be connected to suspects and referenced in the case solution.

## Offline checks

Run `npm test` from the repository root to validate generated-case structure and clue connections across easy, medium, and hard difficulties.
