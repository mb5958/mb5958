import { GoogleGenAI, Modality } from "@google/genai";
import { ImageFile } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const PROMPT = `
Analyze the two images provided.
The first image contains a person. The second image contains an item of clothing.
Your task is to create a new, photorealistic image where the person from the first image is wearing the clothing from the second image.

Key requirements:
1.  **Preserve Clothing Style:** The clothing's design, texture, color, and fit from the second image must be accurately transferred to the person.
2.  **Maintain Person's Identity:** The person's appearance, pose, and the background from the first image should be kept as consistent as possible.
3.  **Seamless Integration:** The final image must look natural and believable, as if the person were genuinely wearing the clothes. Avoid any artificial or 'photoshopped' look.
4.  **Output:** Generate only the final composed image.
`;

export const generateStyledImage = async (personImage: ImageFile, clothingImage: ImageFile): Promise<string | null> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: personImage.base64,
                            mimeType: personImage.mimeType,
                        },
                    },
                    {
                        inlineData: {
                            data: clothingImage.base64,
                            mimeType: clothingImage.mimeType,
                        },
                    },
                    {
                        text: PROMPT,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        if (response.candidates && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData && part.inlineData.data) {
                    return part.inlineData.data; // Return the base64 string of the generated image
                }
            }
        }
        return null;
    } catch (error) {
        console.error("Error generating image with Gemini API:", error);
        throw new Error("生成图片失败。请检查您的 API 密钥和网络连接。");
    }
};