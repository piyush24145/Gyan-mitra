// ✅ DOM Elements
let promptInput = document.querySelector("#prompt");
let chatcontainer = document.querySelector(".chat-container");
let imagebtn = document.querySelector("#image");
let imageinput = document.querySelector("#image input");
let submitBtn = document.querySelector("#submit");

// ✅ Gemini API URL (replace with your valid API key if needed)
const Api_Url =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyB1Rps1rHoHl0lOpEn4pGB_gNcwAuz50DI";

let user = { data: null };

// ✅ API se response generate karna
async function generateResponse(AIChatBox) {
  let text = AIChatBox.querySelector(".AI-chat-area");

  let RequestOption = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text:
                (user.data || "") +
                "\n\nAct like a friendly helpful AI chatbot. " +
                "Reply in natural conversational style, not too formal. " +
                "Start with a small friendly line (like 'Sure!' or 'Got it 👍'). " +
                "If needed, give key points in bullet list, but also explain in short. " +
                "Keep answers clear, helpful, and easy to understand."
            },
          ],
        },
      ],
    }),
  };

  try {
    let response = await fetch(Api_Url, RequestOption);
    let data = await response.json();

    console.log("🔹 API Raw Response:", data);

    // ✅ Check if valid candidates exist
    if (
      !data.candidates ||
      !data.candidates[0] ||
      !data.candidates[0].content ||
      !data.candidates[0].content.parts ||
      !data.candidates[0].content.parts[0].text
    ) {
      console.error("API error or invalid response:", data);
      if (data.error?.message) {
        text.innerHTML = `⚠️ ${data.error.message}`;
      } else {
        text.innerHTML = "⚠️ Sorry, I couldn’t generate a response. Please try again.";
      }
      return;
    }

    // ✅ Extract AI response
    let apiResponse = data.candidates[0].content.parts[0].text.trim();

    // ✅ Format response
    if (apiResponse.includes("\n")) {
      let formattedResponse = apiResponse
        .split("\n")
        .filter((line) => line.trim() !== "")
        .map((line) => {
          if (line.startsWith("-") || line.startsWith("*")) {
            return `<li>${line.replace(/^[-*]\s*/, "")}</li>`;
          }
          return `<p>${line}</p>`;
        })
        .join("");

      text.innerHTML = formattedResponse.includes("<li>")
        ? `<ul>${formattedResponse}</ul>`
        : formattedResponse;
    } else {
      text.innerHTML = `<p>${apiResponse}</p>`;
    }
  } catch (error) {
    console.error("❌ Fetch error:", error);
    text.innerHTML = "⚠️ Network error. Please check your connection and try again.";
  } finally {
    chatcontainer.scrollTo({ top: chatcontainer.scrollHeight, behavior: "smooth" });
  }
}

// ✅ Chat box create karna
function createChatBox(html, classes) {
  let div = document.createElement("div");
  div.innerHTML = html;
  div.classList.add(classes);
  return div;
}

// ✅ User input handle karna
function handlechatResponse(message) {
  user.data = message;

  // User chat
  let html = `
      <img src="https://cdn-icons-png.freepik.com/256/1077/1077114.png" alt="User" width="50">
      <div class="user-chat-area">${user.data}</div>
    `;
  promptInput.value = "";
  let userChatBox = createChatBox(html, "user-chat-box");
  chatcontainer.appendChild(userChatBox);
  chatcontainer.scrollTo({ top: chatcontainer.scrollHeight, behavior: "smooth" });

  // AI Chat Loading
  setTimeout(() => {
    let html = `
          <img src="https://www.shutterstock.com/image-vector/ai-generative-banner-concept-digital-260nw-2430158071.jpg" alt="AI" width="50">
          <div class="AI-chat-area">
            <img src="img2.load.gif" alt="Loading..." class="load" width="50px">
          </div>
        `;
    let AIChatBox = createChatBox(html, "AI-chat-box");
    chatcontainer.appendChild(AIChatBox);
    generateResponse(AIChatBox);
  }, 600);
}

// ✅ Enter press to send
promptInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    if (promptInput.value.trim() !== "") {
      handlechatResponse(promptInput.value.trim());
    }
  }
});

// ✅ Submit button click
submitBtn.addEventListener("click", () => {
  if (promptInput.value.trim() !== "") {
    handlechatResponse(promptInput.value.trim());
  }
});

// ✅ Image upload input change
imageinput.addEventListener("change", () => {
  const file = imageinput.files[0];
  if (!file) return;
  let reader = new FileReader();
  reader.onload = (e) => {
    console.log("🖼️ Image uploaded:", e.target.result);
  };
  reader.readAsDataURL(file);
});

// ✅ Image button click
imagebtn.addEventListener("click", () => {
  imagebtn.querySelector("input").click();
});

