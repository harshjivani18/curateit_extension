document.addEventListener("input", async (e) => {
    const input         = e.target;
    const val           = input.value || input.innerText;
    const checkIsUserLoggedIn = async () => {
        const text = await window.chrome?.storage?.sync.get(["userData"]);
        if (text && text?.userData && text?.userData?.apiUrl) {
          return {
            url: text.userData.apiUrl,
            token: text.userData.token,
            id: text?.userData?.id,
            collectionId: text?.userData?.unfilteredCollectionId,
          };
        } else {
          window.panelToggle(`?open-extension`, true);
          return false;
        }
    };
    if ((val.startsWith("/ai ") || val.startsWith("ai:")) && val.endsWith(";")) {
        const ai    = val.replace("/ai ", "").replace("ai:", "");
        const user  = await checkIsUserLoggedIn();

        if (val.length > 2000) {
            alert("AI prompt is too long. Please keep it under 2000 characters.");
            return
        }

        if (!user) {
            e.target.value = "";
            e.target.innerText = "";
            return;
        };

        const payload = {
            prompt: ai,
        }
        const response      = await fetch(`${user.url}/api/send-ai-response?platform=openai`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            console.error("Error sending AI prompt: ", response);
            return;
        }

        const responseJson  = await response.json();
        if (responseJson.data) {
            if (input.value) {
                input.value = responseJson.data;
            }
            else if (input.innerText) {
                input.innerText = responseJson.data;
            }
        }
    }
})