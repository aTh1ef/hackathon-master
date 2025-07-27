import { type NextRequest, NextResponse } from "next/server";
import { translateBatch } from "@/lib/translate";
import { jsonrepair } from "jsonrepair";
import { PredictionServiceClient } from "@google-cloud/aiplatform";
import { protos } from "@google-cloud/aiplatform";
import { VertexAI } from "@google-cloud/vertexai";

// Helper function to get GCP credentials for Vercel deployment
function getGCPCredentials() {
  // For Vercel deployment, use environment variables
  if (process.env.GCP_PRIVATE_KEY) {
    return {
      credentials: {
        client_email: process.env.GCP_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GCP_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      projectId: process.env.GCP_PROJECT_ID,
    };
  }
  // For local development, use default credentials
  return {};
}

// Helper to robustly extract JSON from a raw string response.
function extractJson(raw: string): any {
  try {
    return JSON.parse(raw);
  } catch {}

  const fenceMatch = raw.match(/``````/);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1]);
    } catch {}
  }

  try {
    return JSON.parse(jsonrepair(raw));
  } catch {}

  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    const slice = raw.slice(start, end + 1);
    try {
      return JSON.parse(jsonrepair(slice));
    } catch {}
  }

  throw new Error("Unable to parse JSON from LLM response");
}

// Mock data to use as a fallback or for demos.
const mockDiagnosis = {
  diseaseName: "Late Blight",
  scientificName: "Phytophthora infestans",
  affectedCrops: ["Tomato", "Potato", "Eggplant", "Pepper"],
  symptoms: [
    "Dark brown to black lesions on leaves",
    "White fuzzy growth on leaf undersides",
    "Rapid wilting and death of plant tissue",
    "Brown spots on fruits",
  ],
  diseaseDescription:
    "Late Blight is a devastating fungal disease that affects tomatoes and potatoes. It thrives in cool, wet conditions and can destroy entire crops within days if left untreated.",
  remedies: {
    cultural: [
      "Improve air circulation by spacing plants properly and pruning lower branches.",
      "Use drip irrigation to keep foliage dry.",
      "Remove and destroy infected plant debris immediately.",
      "Rotate crops with non-host plants for 3-4 years.",
    ],
    biological: [
      "Apply Bacillus subtilis–based fungicides like Serenade Garden.",
      "Use compost tea and spray early in the morning.",
      "Apply Trichoderma-based soil inoculant monthly.",
    ],
    chemical: [
      "Spray copper fungicide every 7-10 days.",
      "For severe cases, rotate systemic fungicides such as chlorothalonil.",
    ],
  },
};

// Helper to translate the entire diagnosis object in a single batch.
async function translateDiagnosis(d: any, lang: string) {
  if (lang === "en") return d;

  const texts = [
    d.diseaseName,
    ...d.affectedCrops,
    d.diseaseDescription,
    ...d.symptoms,
    ...d.remedies.cultural,
    ...d.remedies.biological,
    ...d.remedies.chemical,
  ];

  const tr = await translateBatch(texts, lang);

  let i = 0;
  return {
    ...d,
    diseaseName: tr[i++],
    affectedCrops: d.affectedCrops.map(() => tr[i++]),
    diseaseDescription: tr[i++],
    symptoms: d.symptoms.map(() => tr[i++]),
    remedies: {
      cultural: d.remedies.cultural.map(() => tr[i++]),
      biological: d.remedies.biological.map(() => tr[i++]),
      chemical: d.remedies.chemical.map(() => tr[i++]),
    },
  };
}

export async function POST(req: NextRequest) {
  const { image, language = "en" } = await req.json();

  if (!image) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }

  const { GCP_PROJECT_ID, GCP_LOCATION, VERTEX_AI_ENDPOINT_ID } = process.env;

  if (!GCP_PROJECT_ID || !GCP_LOCATION || !VERTEX_AI_ENDPOINT_ID) {
    console.warn("Vertex AI environment variables missing, returning mock data.");
    const demo = await translateDiagnosis(mockDiagnosis, language);
    return NextResponse.json({
      ...demo,
      isDemo: true,
      message: "Vertex AI config missing – returning demo data",
    });
  }

  try {
    const gcpCredentials = getGCPCredentials();
    const clientOptions = {
      apiEndpoint: `${GCP_LOCATION}-aiplatform.googleapis.com`,
      ...gcpCredentials,
    };

    const client = new PredictionServiceClient(clientOptions);

    const base64Image = image.split(';base64,').pop();
    if (!base64Image) {
      return NextResponse.json({ error: "Invalid image data URI" }, { status: 400 });
    }

    const endpoint = `projects/${GCP_PROJECT_ID}/locations/${GCP_LOCATION}/endpoints/${VERTEX_AI_ENDPOINT_ID}`;
    
    const instance = protos.google.protobuf.Value.fromObject({
      structValue: {
        fields: {
          content: {
            stringValue: base64Image,
          },
        },
      },
    });

    const parameters = protos.google.protobuf.Value.fromObject({
        structValue: {
          fields: {
            confidenceThreshold: {
              numberValue: 0.5,
            },
            maxPredictions: {
              numberValue: 5,
            },
          },
        },
      });

    const requestPayload = {
      endpoint,
      instances: [instance],
      parameters,
    };

    const [response] = await client.predict(requestPayload);
    
    if (!response.predictions || response.predictions.length === 0) {
        throw new Error("Failed to get a valid response from Vertex AI model.");
    }

    const predictionResult = response.predictions[0];
    const structVal = (predictionResult as any).structValue || (predictionResult as any).struct_value;
    
    if (!structVal || !structVal.fields || !structVal.fields.displayNames || !structVal.fields.confidences) {
        console.error("Prediction result from Vertex AI does not contain the expected structure:", JSON.stringify(predictionResult, null, 2));
        throw new Error("Could not find expected fields in Vertex AI response.");
    }
    
    const confidences = structVal.fields.confidences.listValue.values.map((v: any) => v.numberValue);
    const displayNames = structVal.fields.displayNames.listValue.values.map((v: any) => v.stringValue);

    if (confidences.length === 0 || displayNames.length === 0) {
      throw new Error("No predictions returned from the model.");
    }

    let maxConfidence = -1;
    let topPredictionIndex = -1;
    for (let i = 0; i < confidences.length; i++) {
        if (confidences[i] > maxConfidence) {
            maxConfidence = confidences[i];
            topPredictionIndex = i;
        }
    }

    if (topPredictionIndex === -1) {
        throw new Error("Could not determine the top prediction.");
    }

    const diseaseName = displayNames[topPredictionIndex];

    // Updated Gemini call with proper credentials and model
    try {
        const vertex_ai = new VertexAI({
          project: GCP_PROJECT_ID, 
          location: 'global', // Use global location for newer Gemini models
          ...gcpCredentials
        });
        
        // Use a newer, available model
        const generativeModel = vertex_ai.getGenerativeModel({
            model: 'gemini-1.5-flash', // Updated to a more current model
        });

        const imagePart = {
            inlineData: {
                data: base64Image,
                mimeType: image.split(';')[0].split(':')[1],
            },
        };

        const prompt = `You are an expert plant pathologist. Based on the following image and the identified disease name, provide a detailed diagnosis in JSON format. The disease identified is "${diseaseName}". Generate a JSON object with the following structure: { "diseaseName": string, "scientificName": string, "affectedCrops": string[], "symptoms": string[], "diseaseDescription": string, "remedies": { "cultural": string[], "biological": string[], "chemical": string[] } }`;

        const result = await generativeModel.generateContent({
            contents: [{ role: 'user', parts: [imagePart, { text: prompt }] }],
        });

        const geminiResponse = result.response;
        const textResponse = geminiResponse?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textResponse) {
            throw new Error("Failed to get a valid text response from Gemini.");
        }

        let diagnosis;
        try {
          diagnosis = extractJson(textResponse);
        } catch (err) {
          console.error("JSON parse failed. Raw LLM text:\n", textResponse);
          throw new Error("AI_JSON_PARSE_ERROR");
        }

        const finalDiag = await translateDiagnosis(diagnosis, language);
        return NextResponse.json(finalDiag);

    } catch (geminiError) {
        console.warn("\n--- Gemini call failed, falling back to mock data. Error: ---");
        console.warn(geminiError);
        console.warn("----------------------------------------------------------------\n");

        const enrichedMock = { ...mockDiagnosis, diseaseName: diseaseName };
        const demo = await translateDiagnosis(enrichedMock, language);
        return NextResponse.json({
            ...demo,
            isDemo: true,
            message: "Gemini call failed - returning demo data with identified disease.",
        });
    }

  } catch (error) {
    console.error("Error during diagnosis process:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "DIAGNOSIS_ERROR", message: errorMessage },
      { status: 500 }
    );
  }
}

// import { type NextRequest, NextResponse } from "next/server";
// import { translateBatch } from "@/lib/translate";
// import { jsonrepair } from "jsonrepair";
// import { PredictionServiceClient } from "@google-cloud/aiplatform";
// import { protos } from "@google-cloud/aiplatform";
// import { VertexAI } from "@google-cloud/vertexai";

// // Helper to robustly extract JSON from a raw string response.
// function extractJson(raw: string): any {
//   try {
//     return JSON.parse(raw);
//   } catch {}

//   const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
//   if (fenceMatch) {
//     try {
//       return JSON.parse(fenceMatch[1]);
//     } catch {}
//   }

//   try {
//     return JSON.parse(jsonrepair(raw));
//   } catch {}

//   const start = raw.indexOf("{");
//   const end = raw.lastIndexOf("}");
//   if (start !== -1 && end !== -1 && end > start) {
//     const slice = raw.slice(start, end + 1);
//     try {
//       return JSON.parse(jsonrepair(slice));
//     } catch {}
//   }

//   throw new Error("Unable to parse JSON from LLM response");
// }

// // Mock data to use as a fallback or for demos.
// const mockDiagnosis = {
//   diseaseName: "Late Blight",
//   scientificName: "Phytophthora infestans",
//   affectedCrops: ["Tomato", "Potato", "Eggplant", "Pepper"],
//   symptoms: [
//     "Dark brown to black lesions on leaves",
//     "White fuzzy growth on leaf undersides",
//     "Rapid wilting and death of plant tissue",
//     "Brown spots on fruits",
//   ],
//   diseaseDescription:
//     "Late Blight is a devastating fungal disease that affects tomatoes and potatoes. It thrives in cool, wet conditions and can destroy entire crops within days if left untreated.",
//   remedies: {
//     cultural: [
//       "Improve air circulation by spacing plants properly and pruning lower branches.",
//       "Use drip irrigation to keep foliage dry.",
//       "Remove and destroy infected plant debris immediately.",
//       "Rotate crops with non-host plants for 3-4 years.",
//     ],
//     biological: [
//       "Apply Bacillus subtilis–based fungicides like Serenade Garden.",
//       "Use compost tea and spray early in the morning.",
//       "Apply Trichoderma-based soil inoculant monthly.",
//     ],
//     chemical: [
//       "Spray copper fungicide every 7-10 days.",
//       "For severe cases, rotate systemic fungicides such as chlorothalonil.",
//     ],
//   },
// };

// // Helper to translate the entire diagnosis object in a single batch.
// async function translateDiagnosis(d: any, lang: string) {
//   if (lang === "en") return d;

//   const texts = [
//     d.diseaseName,
//     ...d.affectedCrops,
//     d.diseaseDescription,
//     ...d.symptoms,
//     ...d.remedies.cultural,
//     ...d.remedies.biological,
//     ...d.remedies.chemical,
//   ];

//   const tr = await translateBatch(texts, lang);

//   let i = 0;
//   return {
//     ...d,
//     diseaseName: tr[i++],
//     affectedCrops: d.affectedCrops.map(() => tr[i++]),
//     diseaseDescription: tr[i++],
//     symptoms: d.symptoms.map(() => tr[i++]),
//     remedies: {
//       cultural: d.remedies.cultural.map(() => tr[i++]),
//       biological: d.remedies.biological.map(() => tr[i++]),
//       chemical: d.remedies.chemical.map(() => tr[i++]),
//     },
//   };
// }

// export async function POST(req: NextRequest) {
//   const { image, language = "en" } = await req.json();

//   if (!image) {
//     return NextResponse.json({ error: "No image provided" }, { status: 400 });
//   }

//   const { GCP_PROJECT_ID, GCP_LOCATION, VERTEX_AI_ENDPOINT_ID, GEMINI_API_KEY } = process.env;

//   if (!GCP_PROJECT_ID || !GCP_LOCATION || !VERTEX_AI_ENDPOINT_ID) {
//     console.warn("Vertex AI environment variables missing, returning mock data.");
//     const demo = await translateDiagnosis(mockDiagnosis, language);
//     return NextResponse.json({
//       ...demo,
//       isDemo: true,
//       message: "Vertex AI config missing – returning demo data",
//     });
//   }

//   try {
//     const clientOptions = {
//         apiEndpoint: `${GCP_LOCATION}-aiplatform.googleapis.com`,
//     };

//     const client = new PredictionServiceClient(clientOptions);

//     const base64Image = image.split(';base64,').pop();
//     if (!base64Image) {
//       return NextResponse.json({ error: "Invalid image data URI" }, { status: 400 });
//     }

//     const endpoint = `projects/${GCP_PROJECT_ID}/locations/${GCP_LOCATION}/endpoints/${VERTEX_AI_ENDPOINT_ID}`;
    
//     const instance = protos.google.protobuf.Value.fromObject({
//       structValue: {
//         fields: {
//           content: {
//             stringValue: base64Image,
//           },
//         },
//       },
//     });

//     const parameters = protos.google.protobuf.Value.fromObject({
//         structValue: {
//           fields: {
//             confidenceThreshold: {
//               numberValue: 0.5,
//             },
//             maxPredictions: {
//               numberValue: 5,
//             },
//           },
//         },
//       });

//     const requestPayload = {
//       endpoint,
//       instances: [instance],
//       parameters,
//     };

//     const [response] = await client.predict(requestPayload);
    
//     if (!response.predictions || response.predictions.length === 0) {
//         throw new Error("Failed to get a valid response from Vertex AI model.");
//     }

//     const predictionResult = response.predictions[0];
//     // The key in the prediction result can be either 'structValue' or 'struct_value'
//     const structVal = (predictionResult as any).structValue || (predictionResult as any).struct_value;
    
//     if (!structVal || !structVal.fields || !structVal.fields.displayNames || !structVal.fields.confidences) {
//         console.error("Prediction result from Vertex AI does not contain the expected structure:", JSON.stringify(predictionResult, null, 2));
//         throw new Error("Could not find expected fields in Vertex AI response.");
//     }
    
//     const confidences = structVal.fields.confidences.listValue.values.map((v: any) => v.numberValue);
//     const displayNames = structVal.fields.displayNames.listValue.values.map((v: any) => v.stringValue);

//     if (confidences.length === 0 || displayNames.length === 0) {
//       throw new Error("No predictions returned from the model.");
//     }

//     // Find the prediction with the highest confidence
//     let maxConfidence = -1;
//     let topPredictionIndex = -1;
//     for (let i = 0; i < confidences.length; i++) {
//         if (confidences[i] > maxConfidence) {
//             maxConfidence = confidences[i];
//             topPredictionIndex = i;
//         }
//     }

//     if (topPredictionIndex === -1) {
//         throw new Error("Could not determine the top prediction.");
//     }

//     const diseaseName = displayNames[topPredictionIndex];

//     if (!GEMINI_API_KEY) {
//         console.warn("GEMINI_API_KEY missing, returning mock data enriched with prediction.");
//         const enrichedMock = { ...mockDiagnosis, diseaseName: diseaseName };
//         const demo = await translateDiagnosis(enrichedMock, language);
//         return NextResponse.json({
//             ...demo,
//             isDemo: true,
//             message: "Gemini API key missing – returning demo data",
//         });
//     }

//     // Now, try to call Gemini with the disease name and image
//     try {
//         const vertex_ai = new VertexAI({project: GCP_PROJECT_ID, location: GCP_LOCATION});
//         const generativeModel = vertex_ai.getGenerativeModel({
//             model: 'gemini-1.0-pro-vision',
//         });

//         const imagePart = {
//             inlineData: {
//                 data: base64Image,
//                 mimeType: image.split(';')[0].split(':')[1],
//             },
//         };

//         const prompt = `You are an expert plant pathologist. Based on the following image and the identified disease name, provide a detailed diagnosis in JSON format. The disease identified is "${diseaseName}". Generate a JSON object with the following structure: { "diseaseName": string, "scientificName": string, "affectedCrops": string[], "symptoms": string[], "diseaseDescription": string, "remedies": { "cultural": string[], "biological": string[], "chemical": string[] } }`;

//         const result = await generativeModel.generateContent({
//             contents: [{ role: 'user', parts: [imagePart, { text: prompt }] }],
//         });

//         const geminiResponse = result.response;
//         const textResponse = geminiResponse?.candidates?.[0]?.content?.parts?.[0]?.text;

//         if (!textResponse) {
//             throw new Error("Failed to get a valid text response from Gemini.");
//         }

//         let diagnosis;
//         try {
//           diagnosis = extractJson(textResponse);
//         } catch (err) {
//           console.error("JSON parse failed. Raw LLM text:\n", textResponse);
//           throw new Error("AI_JSON_PARSE_ERROR");
//         }

//         const finalDiag = await translateDiagnosis(diagnosis, language);
//         return NextResponse.json(finalDiag);

//     } catch (geminiError) {
//         console.warn("\n--- Gemini call failed, falling back to mock data. Error: ---");
//         console.warn(geminiError);
//         console.warn("----------------------------------------------------------------\n");

//         // Fallback to mock data, but use the disease name from the custom model
//         const enrichedMock = { ...mockDiagnosis, diseaseName: diseaseName };
//         const demo = await translateDiagnosis(enrichedMock, language);
//         return NextResponse.json({
//             ...demo,
//             isDemo: true,
//             message: "Gemini call failed - returning demo data with identified disease.",
//         });
//     }

//   } catch (error) {
//     console.error("Error during diagnosis process:", error);
//     const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
//     return NextResponse.json(
//       { error: "DIAGNOSIS_ERROR", message: errorMessage },
//       { status: 500 }
//     );
//   }
// }


// import { type NextRequest, NextResponse } from "next/server";
// import { translateBatch } from "@/lib/translate";
// import { jsonrepair } from "jsonrepair";
// import { PredictionServiceClient } from "@google-cloud/aiplatform";
// import { protos } from "@google-cloud/aiplatform";

// // Helper to robustly extract JSON from a raw string response.
// function extractJson(raw: string): any {
//   try {
//     return JSON.parse(raw);
//   } catch {}

//   const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
//   if (fenceMatch) {
//     try {
//       return JSON.parse(fenceMatch[1]);
//     } catch {}
//   }

//   try {
//     return JSON.parse(jsonrepair(raw));
//   } catch {}

//   const start = raw.indexOf("{");
//   const end = raw.lastIndexOf("}");
//   if (start !== -1 && end !== -1 && end > start) {
//     const slice = raw.slice(start, end + 1);
//     try {
//       return JSON.parse(jsonrepair(slice));
//     } catch {}
//   }

//   throw new Error("Unable to parse JSON from LLM response");
// }

// // Mock data to use as a fallback or for demos.
// const mockDiagnosis = {
//   diseaseName: "Late Blight",
//   scientificName: "Phytophthora infestans",
//   affectedCrops: ["Tomato", "Potato", "Eggplant", "Pepper"],
//   symptoms: [
//     "Dark brown to black lesions on leaves",
//     "White fuzzy growth on leaf undersides",
//     "Rapid wilting and death of plant tissue",
//     "Brown spots on fruits",
//   ],
//   diseaseDescription:
//     "Late Blight is a devastating fungal disease that affects tomatoes and potatoes. It thrives in cool, wet conditions and can destroy entire crops within days if left untreated.",
//   remedies: {
//     cultural: [
//       "Improve air circulation by spacing plants properly and pruning lower branches.",
//       "Use drip irrigation to keep foliage dry.",
//       "Remove and destroy infected plant debris immediately.",
//       "Rotate crops with non-host plants for 3-4 years.",
//     ],
//     biological: [
//       "Apply Bacillus subtilis–based fungicides like Serenade Garden.",
//       "Use compost tea and spray early in the morning.",
//       "Apply Trichoderma-based soil inoculant monthly.",
//     ],
//     chemical: [
//       "Spray copper fungicide every 7-10 days.",
//       "For severe cases, rotate systemic fungicides such as chlorothalonil.",
//     ],
//   },
// };

// // Helper to translate the entire diagnosis object in a single batch.
// async function translateDiagnosis(d: any, lang: string) {
//   if (lang === "en") return d;

//   const texts = [
//     d.diseaseName,
//     ...d.affectedCrops,
//     d.diseaseDescription,
//     ...d.symptoms,
//     ...d.remedies.cultural,
//     ...d.remedies.biological,
//     ...d.remedies.chemical,
//   ];

//   const tr = await translateBatch(texts, lang);

//   let i = 0;
//   return {
//     ...d,
//     diseaseName: tr[i++],
//     affectedCrops: d.affectedCrops.map(() => tr[i++]),
//     diseaseDescription: tr[i++],
//     symptoms: d.symptoms.map(() => tr[i++]),
//     remedies: {
//       cultural: d.remedies.cultural.map(() => tr[i++]),
//       biological: d.remedies.biological.map(() => tr[i++]),
//       chemical: d.remedies.chemical.map(() => tr[i++]),
//     },
//   };
// }

// export async function POST(req: NextRequest) {
//   const { image, language = "en" } = await req.json();

//   if (!image) {
//     return NextResponse.json({ error: "No image provided" }, { status: 400 });
//   }

//   const { GCP_PROJECT_ID, GCP_LOCATION, VERTEX_AI_ENDPOINT_ID } = process.env;

//   if (!GCP_PROJECT_ID || !GCP_LOCATION || !VERTEX_AI_ENDPOINT_ID) {
//     console.warn("Vertex AI environment variables missing, returning mock data.");
//     const demo = await translateDiagnosis(mockDiagnosis, language);
//     return NextResponse.json({
//       ...demo,
//       isDemo: true,
//       message: "Vertex AI config missing – returning demo data",
//     });
//   }

//   try {
//     const clientOptions = {
//         apiEndpoint: `${GCP_LOCATION}-aiplatform.googleapis.com`,
//     };

//     const client = new PredictionServiceClient(clientOptions);

//     const base64Image = image.split(';base64,').pop();
//     if (!base64Image) {
//       return NextResponse.json({ error: "Invalid image data URI" }, { status: 400 });
//     }

//     const endpoint = `projects/${GCP_PROJECT_ID}/locations/${GCP_LOCATION}/endpoints/${VERTEX_AI_ENDPOINT_ID}`;

//     // Construct the instance payload for an AutoML image classification model
//     const instance = {
//       structValue: {
//         fields: {
//           content: {
//             stringValue: base64Image
//           }
//         }
//       }
//     };
    
//     // The request payload for a custom model prediction
//     const requestPayload = {
//       endpoint,
//       instances: [new protos.google.protobuf.Value(instance)],
//     };

//     const [response] = await client.predict(requestPayload);
    
//     if (!response.predictions || response.predictions.length === 0) {
//         throw new Error("Failed to get a valid response from Vertex AI model.");
//     }
    
//     // Assuming the model returns a JSON string in the first prediction
//     const predictionResult = response.predictions[0];
    
//     // The output from your AutoML model might be different. 
//     // You may need to inspect `predictionResult` and adjust the parsing logic.
//     // Here we're assuming the output is a struct with a 'stringVal' field
//     // containing the JSON output.
//     const stringVal = (predictionResult as any).stringValue || (predictionResult as any).string_value;
    
//     if (!stringVal) {
//         // If stringVal is not present, the model might be returning a different structure.
//         // For AutoML image classification, the result is often in a structValue.
//         const structVal = (predictionResult as any).structValue || (predictionResult as any).struct_value;
//         if(structVal && structVal.fields && structVal.fields.displayNames && structVal.fields.confidences) {
//              // This assumes a classification model output.
//              // You'll need to adapt this to your specific model's output schema.
//              // For this example, let's just log it.
//              console.log("Received structured prediction:", JSON.stringify(structVal, null, 2));
//              // For now, let's fall back to mock data if we can't parse the expected JSON string.
//              const demo = await translateDiagnosis(mockDiagnosis, language);
//              return NextResponse.json({
//                ...demo,
//                isDemo: true,
//                message: "Model returned structured data, not a JSON string. Falling back to demo data.",
//              });
//         }
        
//         console.error("Prediction result from Vertex AI does not contain a stringValue or a recognized structure:", JSON.stringify(predictionResult, null, 2));
//         throw new Error("Could not find prediction string in Vertex AI response.");
//     }

//     let diagnosis;
//     try {
//       diagnosis = extractJson(stringVal);
//     } catch (err) {
//       console.error("JSON parse failed. Raw LLM text:\n", stringVal);
//       return NextResponse.json(
//         {
//           error: "AI_JSON_PARSE_ERROR",
//           message: "Failed to parse JSON from AI response.",
//           raw: stringVal.slice(0, 5000),
//         },
//         { status: 500 }
//       );
//     }

//     const finalDiag = await translateDiagnosis(diagnosis, language);
//     return NextResponse.json(finalDiag);

//   } catch (error) {
//     console.error("Error calling Vertex AI:", error);
//     const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
//     return NextResponse.json(
//       { error: "VERTEX_AI_ERROR", message: errorMessage },
//       { status: 500 }
//     );
//   }
// }

    

// import { type NextRequest, NextResponse } from "next/server";
// import { translateBatch } from "@/lib/translate";
// import { jsonrepair } from "jsonrepair";
// import { PredictionServiceClient, protos } from "@google-cloud/vertexai";
// import { GoogleAuth } from 'google-auth-library';

// // Helper to robustly extract JSON from a raw string response.
// function extractJson(raw: string): any {
//   try {
//     return JSON.parse(raw);
//   } catch {}

//   const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
//   if (fenceMatch) {
//     try {
//       return JSON.parse(fenceMatch[1]);
//     } catch {}
//   }

//   try {
//     return JSON.parse(jsonrepair(raw));
//   } catch {}

//   const start = raw.indexOf("{");
//   const end = raw.lastIndexOf("}");
//   if (start !== -1 && end !== -1 && end > start) {
//     const slice = raw.slice(start, end + 1);
//     try {
//       return JSON.parse(jsonrepair(slice));
//     } catch {}
//   }

//   throw new Error("Unable to parse JSON from LLM response");
// }

// // Mock data to use as a fallback or for demos.
// const mockDiagnosis = {
//   diseaseName: "Late Blight",
//   scientificName: "Phytophthora infestans",
//   affectedCrops: ["Tomato", "Potato", "Eggplant", "Pepper"],
//   symptoms: [
//     "Dark brown to black lesions on leaves",
//     "White fuzzy growth on leaf undersides",
//     "Rapid wilting and death of plant tissue",
//     "Brown spots on fruits",
//   ],
//   diseaseDescription:
//     "Late Blight is a devastating fungal disease that affects tomatoes and potatoes. It thrives in cool, wet conditions and can destroy entire crops within days if left untreated.",
//   remedies: {
//     cultural: [
//       "Improve air circulation by spacing plants properly and pruning lower branches.",
//       "Use drip irrigation to keep foliage dry.",
//       "Remove and destroy infected plant debris immediately.",
//       "Rotate crops with non-host plants for 3-4 years.",
//     ],
//     biological: [
//       "Apply Bacillus subtilis–based fungicides like Serenade Garden.",
//       "Use compost tea and spray early in the morning.",
//       "Apply Trichoderma-based soil inoculant monthly.",
//     ],
//     chemical: [
//       "Spray copper fungicide every 7-10 days.",
//       "For severe cases, rotate systemic fungicides such as chlorothalonil.",
//     ],
//   },
// };

// // Helper to translate the entire diagnosis object in a single batch.
// async function translateDiagnosis(d: any, lang: string) {
//   if (lang === "en") return d;

//   const texts = [
//     d.diseaseName,
//     ...d.affectedCrops,
//     d.diseaseDescription,
//     ...d.symptoms,
//     ...d.remedies.cultural,
//     ...d.remedies.biological,
//     ...d.remedies.chemical,
//   ];

//   const tr = await translateBatch(texts, lang);

//   let i = 0;
//   return {
//     ...d,
//     diseaseName: tr[i++],
//     affectedCrops: d.affectedCrops.map(() => tr[i++]),
//     diseaseDescription: tr[i++],
//     symptoms: d.symptoms.map(() => tr[i++]),
//     remedies: {
//       cultural: d.remedies.cultural.map(() => tr[i++]),
//       biological: d.remedies.biological.map(() => tr[i++]),
//       chemical: d.remedies.chemical.map(() => tr[i++]),
//     },
//   };
// }

// export async function POST(req: NextRequest) {
//   const { image, language = "en" } = await req.json();

//   if (!image) {
//     return NextResponse.json({ error: "No image provided" }, { status: 400 });
//   }

//   const { GCP_PROJECT_ID, GCP_LOCATION, VERTEX_AI_ENDPOINT_ID } = process.env;

//   if (!GCP_PROJECT_ID || !GCP_LOCATION || !VERTEX_AI_ENDPOINT_ID) {
//     console.warn("Vertex AI environment variables missing, returning mock data.");
//     const demo = await translateDiagnosis(mockDiagnosis, language);
//     return NextResponse.json({
//       ...demo,
//       isDemo: true,
//       message: "Vertex AI config missing – returning demo data",
//     });
//   }

//   try {
//     const auth = new GoogleAuth({
//       scopes: 'https://www.googleapis.com/auth/cloud-platform',
//       ...(process.env.GOOGLE_APPLICATION_CREDENTIALS && {
//         keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
//       }),
//     });
//     const authClient = await auth.getClient();

//     const client = new PredictionServiceClient({
//       auth: authClient,
//       apiEndpoint: `${GCP_LOCATION}-aiplatform.googleapis.com`,
//     });

//     const base64Image = image.split(';base64,').pop();
//     if (!base64Image) {
//       return NextResponse.json({ error: "Invalid image data URI" }, { status: 400 });
//     }

//     const endpoint = `projects/${GCP_PROJECT_ID}/locations/${GCP_LOCATION}/endpoints/${VERTEX_AI_ENDPOINT_ID}`;

//     const instance = {
//       structValue: {
//         fields: {
//           b64: {
//             stringValue: base64Image
//           }
//         }
//       }
//     };
    
//     // The request payload for a custom model prediction
//     const requestPayload = {
//       endpoint,
//       instances: [new protos.google.protobuf.Value(instance)],
//     };

//     const [response] = await client.predict(requestPayload);
    
//     if (!response.predictions || response.predictions.length === 0) {
//         throw new Error("Failed to get a valid response from Vertex AI model.");
//     }
    
//     // Assuming the model returns a JSON string in the first prediction
//     const predictionResult = response.predictions[0];
    
//     // The output from your AutoML model might be different. 
//     // You may need to inspect `predictionResult` and adjust the parsing logic.
//     // Here we're assuming the output is a struct with a 'stringVal' field
//     // containing the JSON output.
//     const stringVal = (predictionResult as any).stringValue || (predictionResult as any).string_value;
    
//     if (!stringVal) {
//         console.error("Prediction result from Vertex AI does not contain a stringValue:", JSON.stringify(predictionResult, null, 2));
//         throw new Error("Could not find prediction string in Vertex AI response.");
//     }

//     let diagnosis;
//     try {
//       diagnosis = extractJson(stringVal);
//     } catch (err) {
//       console.error("JSON parse failed. Raw LLM text:\n", stringVal);
//       return NextResponse.json(
//         {
//           error: "AI_JSON_PARSE_ERROR",
//           message: "Failed to parse JSON from AI response.",
//           raw: stringVal.slice(0, 5000),
//         },
//         { status: 500 }
//       );
//     }

//     const finalDiag = await translateDiagnosis(diagnosis, language);
//     return NextResponse.json(finalDiag);

//   } catch (error) {
//     console.error("Error calling Vertex AI:", error);
//     const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
//     return NextResponse.json(
//       { error: "VERTEX_AI_ERROR", message: errorMessage },
//       { status: 500 }
//     );
//   }
// }
// import { type NextRequest, NextResponse } from "next/server";
// import { translateBatch } from "@/lib/translate";
// import { jsonrepair } from "jsonrepair";
// import { VertexAI } from "@google-cloud/vertexai";

// // Helper to robustly extract JSON from a raw string response.
// function extractJson(raw: string): any {
//   try {
//     return JSON.parse(raw);
//   } catch {}

//   const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
//   if (fenceMatch) {
//     try {
//       return JSON.parse(fenceMatch[1]);
//     } catch {}
//   }

//   try {
//     return JSON.parse(jsonrepair(raw));
//   } catch {}

//   const start = raw.indexOf("{");
//   const end = raw.lastIndexOf("}");
//   if (start !== -1 && end !== -1 && end > start) {
//     const slice = raw.slice(start, end + 1);
//     try {
//       return JSON.parse(jsonrepair(slice));
//     } catch {}
//   }

//   throw new Error("Unable to parse JSON from LLM response");
// }

// // Mock data to use as a fallback or for demos.
// const mockDiagnosis = {
//   diseaseName: "Late Blight",
//   scientificName: "Phytophthora infestans",
//   affectedCrops: ["Tomato", "Potato", "Eggplant", "Pepper"],
//   symptoms: [
//     "Dark brown to black lesions on leaves",
//     "White fuzzy growth on leaf undersides",
//     "Rapid wilting and death of plant tissue",
//     "Brown spots on fruits",
//   ],
//   diseaseDescription:
//     "Late Blight is a devastating fungal disease that affects tomatoes and potatoes. It thrives in cool, wet conditions and can destroy entire crops within days if left untreated.",
//   remedies: {
//     cultural: [
//       "Improve air circulation by spacing plants properly and pruning lower branches.",
//       "Use drip irrigation to keep foliage dry.",
//       "Remove and destroy infected plant debris immediately.",
//       "Rotate crops with non-host plants for 3-4 years.",
//     ],
//     biological: [
//       "Apply Bacillus subtilis–based fungicides like Serenade Garden.",
//       "Use compost tea and spray early in the morning.",
//       "Apply Trichoderma-based soil inoculant monthly.",
//     ],
//     chemical: [
//       "Spray copper fungicide every 7-10 days.",
//       "For severe cases, rotate systemic fungicides such as chlorothalonil.",
//     ],
//   },
// };

// // Helper to translate the entire diagnosis object in a single batch.
// async function translateDiagnosis(d: any, lang: string) {
//   if (lang === "en") return d;

//   const texts = [
//     d.diseaseName,
//     ...d.affectedCrops,
//     d.diseaseDescription,
//     ...d.symptoms,
//     ...d.remedies.cultural,
//     ...d.remedies.biological,
//     ...d.remedies.chemical,
//   ];

//   const tr = await translateBatch(texts, lang);

//   let i = 0;
//   return {
//     ...d,
//     diseaseName: tr[i++],
//     affectedCrops: d.affectedCrops.map(() => tr[i++]),
//     diseaseDescription: tr[i++],
//     symptoms: d.symptoms.map(() => tr[i++]),
//     remedies: {
//       cultural: d.remedies.cultural.map(() => tr[i++]),
//       biological: d.remedies.biological.map(() => tr[i++]),
//       chemical: d.remedies.chemical.map(() => tr[i++]),
//     },
//   };
// }

// export async function POST(req: NextRequest) {
//   const { image, language = "en" } = await req.json();

//   if (!image) {
//     return NextResponse.json({ error: "No image provided" }, { status: 400 });
//   }

//   const { GCP_PROJECT_ID, GCP_LOCATION, VERTEX_AI_ENDPOINT_ID } = process.env;

//   if (!GCP_PROJECT_ID || !GCP_LOCATION || !VERTEX_AI_ENDPOINT_ID) {
//     console.warn("Vertex AI environment variables missing, returning mock data.");
//     const demo = await translateDiagnosis(mockDiagnosis, language);
//     return NextResponse.json({
//       ...demo,
//       isDemo: true,
//       message: "Vertex AI config missing – returning demo data",
//     });
//   }

//   const prompt = String.raw`Based on the label, you are an expert agronomist AI. Analyze the provided crop image and respond with ONLY a single, valid, minified JSON object. The JSON must conform EXACTLY to this schema (do not include markdown, comments, or any other text outside the JSON):

// {
// "diseaseName":        string,
// "scientificName":     string,
// "affectedCrops":      string[],
// "symptoms":           string[],
// "diseaseDescription": string,
// "remedies": {
//   "cultural":   string[],
//   "biological": string[],
//   "chemical":   string[]
// }
// }

// IMPORTANT: For "affectedCrops", list 3-5 common crop types susceptible to this disease, not just the one in the image.

// If the plant appears healthy, set "diseaseName" to "Healthy Crop", "scientificName" to "N/A", and leave all other fields as empty arrays or empty strings.`;

//   try {
//     const vertex_ai = new VertexAI({
//       project: GCP_PROJECT_ID,
//       location: GCP_LOCATION,
//     });

//     const base64Image = image.split(';base64,').pop();
//     if (!base64Image) {
//       return NextResponse.json({ error: "Invalid image data URI" }, { status: 400 });
//     }
    
//     // Use your custom model endpoint
//     const endpoint = vertex_ai.getGenerativeModel({
//       model: `projects/${GCP_PROJECT_ID}/locations/${GCP_LOCATION}/endpoints/${VERTEX_AI_ENDPOINT_ID}`,
//     });

//     const imagePart = {
//       inlineData: {
//         data: base64Image,
//         mimeType: image.substring(image.indexOf(":") + 1, image.indexOf(";")),
//       },
//     };

//     const requestPayload = {
//       contents: [{ role: "user", parts: [{ text: prompt }, imagePart] }],
//     };

//     const result = await endpoint.generateContent(requestPayload);
    
//     const response = result.response;
//     if (!response?.candidates?.[0]?.content?.parts?.[0]?.text) {
//       console.error("Invalid response structure from Vertex AI:", JSON.stringify(response, null, 2));
//       throw new Error("Failed to get a valid response from Vertex AI model.");
//     }
//     const text = response.candidates[0].content.parts[0].text;

//     let diagnosis;
//     try {
//       diagnosis = extractJson(text);
//     } catch (err) {
//       console.error("JSON parse failed. Raw LLM text:\n", text);
//       return NextResponse.json(
//         {
//           error: "AI_JSON_PARSE_ERROR",
//           message: "Failed to parse JSON from AI response.",
//           raw: text.slice(0, 5000),
//         },
//         { status: 500 }
//       );
//     }

//     const finalDiag = await translateDiagnosis(diagnosis, language);
//     return NextResponse.json(finalDiag);

//   } catch (error) {
//     console.error("Error calling Vertex AI:", error);
//     const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
//     return NextResponse.json(
//       { error: "VERTEX_AI_ERROR", message: errorMessage },
//       { status: 500 }
//     );
//   }
// }

// import { type NextRequest, NextResponse } from "next/server";
// import { translateBatch } from "@/lib/translate";
// import { jsonrepair } from "jsonrepair";
// import { VertexAI } from "@google-cloud/vertexai";

// // Helper to robustly extract JSON from a raw string response.
// function extractJson(raw: string): any {
//   try {
//     return JSON.parse(raw);
//   } catch {}

//   const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
//   if (fenceMatch) {
//     try {
//       return JSON.parse(fenceMatch[1]);
//     } catch {}
//   }

//   try {
//     return JSON.parse(jsonrepair(raw));
//   } catch {}

//   const start = raw.indexOf("{");
//   const end = raw.lastIndexOf("}");
//   if (start !== -1 && end !== -1 && end > start) {
//     const slice = raw.slice(start, end + 1);
//     try {
//       return JSON.parse(jsonrepair(slice));
//     } catch {}
//   }

//   throw new Error("Unable to parse JSON from LLM response");
// }

// // Mock data to use as a fallback or for demos.
// const mockDiagnosis = {
//   diseaseName: "Late Blight",
//   scientificName: "Phytophthora infestans",
//   affectedCrops: ["Tomato", "Potato", "Eggplant", "Pepper"],
//   symptoms: [
//     "Dark brown to black lesions on leaves",
//     "White fuzzy growth on leaf undersides",
//     "Rapid wilting and death of plant tissue",
//     "Brown spots on fruits",
//   ],
//   diseaseDescription:
//     "Late Blight is a devastating fungal disease that affects tomatoes and potatoes. It thrives in cool, wet conditions and can destroy entire crops within days if left untreated.",
//   remedies: {
//     cultural: [
//       "Improve air circulation by spacing plants properly and pruning lower branches.",
//       "Use drip irrigation to keep foliage dry.",
//       "Remove and destroy infected plant debris immediately.",
//       "Rotate crops with non-host plants for 3-4 years.",
//     ],
//     biological: [
//       "Apply Bacillus subtilis–based fungicides like Serenade Garden.",
//       "Use compost tea and spray early in the morning.",
//       "Apply Trichoderma-based soil inoculant monthly.",
//     ],
//     chemical: [
//       "Spray copper fungicide every 7-10 days.",
//       "For severe cases, rotate systemic fungicides such as chlorothalonil.",
//     ],
//   },
// };

// // Helper to translate the entire diagnosis object in a single batch.
// async function translateDiagnosis(d: any, lang: string) {
//   if (lang === "en") return d;

//   const texts = [
//     d.diseaseName,
//     ...d.affectedCrops,
//     d.diseaseDescription,
//     ...d.symptoms,
//     ...d.remedies.cultural,
//     ...d.remedies.biological,
//     ...d.remedies.chemical,
//   ];

//   const tr = await translateBatch(texts, lang);

//   let i = 0;
//   return {
//     ...d,
//     diseaseName: tr[i++],
//     affectedCrops: d.affectedCrops.map(() => tr[i++]),
//     diseaseDescription: tr[i++],
//     symptoms: d.symptoms.map(() => tr[i++]),
//     remedies: {
//       cultural: d.remedies.cultural.map(() => tr[i++]),
//       biological: d.remedies.biological.map(() => tr[i++]),
//       chemical: d.remedies.chemical.map(() => tr[i++]),
//     },
//   };
// }

// export async function POST(req: NextRequest) {
//   const { image, language = "en" } = await req.json();

//   if (!image) {
//     return NextResponse.json({ error: "No image provided" }, { status: 400 });
//   }

//   const { GCP_PROJECT_ID, GCP_LOCATION, VERTEX_AI_ENDPOINT_ID } = process.env;

//   if (!GCP_PROJECT_ID || !GCP_LOCATION || !VERTEX_AI_ENDPOINT_ID) {
//     console.warn("Vertex AI environment variables missing, returning mock data.");
//     const demo = await translateDiagnosis(mockDiagnosis, language);
//     return NextResponse.json({
//       ...demo,
//       isDemo: true,
//       message: "Vertex AI config missing – returning demo data",
//     });
//   }

//   const prompt = String.raw`Based on the label, you are an expert agronomist AI. Analyze the provided crop image and respond with ONLY a single, valid, minified JSON object. The JSON must conform EXACTLY to this schema (do not include markdown, comments, or any other text outside the JSON):

// {
// "diseaseName":        string,
// "scientificName":     string,
// "affectedCrops":      string[],
// "symptoms":           string[],
// "diseaseDescription": string,
// "remedies": {
//   "cultural":   string[],
//   "biological": string[],
//   "chemical":   string[]
// }
// }

// IMPORTANT: For "affectedCrops", list 3-5 common crop types susceptible to this disease, not just the one in the image.

// If the plant appears healthy, set "diseaseName" to "Healthy Crop", "scientificName" to "N/A", and leave all other fields as empty arrays or empty strings.`;

//   try {
//     const vertex_ai = new VertexAI({
//       project: GCP_PROJECT_ID,
//       location: GCP_LOCATION,
//     });

//     const base64Image = image.split(';base64,').pop();
//     if (!base64Image) {
//       return NextResponse.json({ error: "Invalid image data URI" }, { status: 400 });
//     }
    
//     // Use your custom model endpoint
//     const endpoint = vertex_ai.getGenerativeModel({
//       model: `projects/${GCP_PROJECT_ID}/locations/${GCP_LOCATION}/endpoints/${VERTEX_AI_ENDPOINT_ID}`,
//     });

//     const imagePart = {
//       inlineData: {
//         data: base64Image,
//         mimeType: image.substring(image.indexOf(":") + 1, image.indexOf(";")),
//       },
//     };

//     const requestPayload = {
//       contents: [{ role: "user", parts: [{ text: prompt }, imagePart] }],
//     };

//     const result = await endpoint.generateContent(requestPayload);
    
//     const response = result.response;
//     if (!response?.candidates?.[0]?.content?.parts?.[0]?.text) {
//       console.error("Invalid response structure from Vertex AI:", JSON.stringify(response, null, 2));
//       throw new Error("Failed to get a valid response from Vertex AI model.");
//     }
//     const text = response.candidates[0].content.parts[0].text;

//     let diagnosis;
//     try {
//       diagnosis = extractJson(text);
//     } catch (err) {
//       console.error("JSON parse failed. Raw LLM text:\n", text);
//       return NextResponse.json(
//         {
//           error: "AI_JSON_PARSE_ERROR",
//           message: "Failed to parse JSON from AI response.",
//           raw: text.slice(0, 5000),
//         },
//         { status: 500 }
//       );
//     }

//     const finalDiag = await translateDiagnosis(diagnosis, language);
//     return NextResponse.json(finalDiag);

//   } catch (error) {
//     console.error("Error calling Vertex AI:", error);
//     const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
//     return NextResponse.json(
//       { error: "VERTEX_AI_ERROR", message: errorMessage },
//       { status: 500 }
//     );
//   }
// }