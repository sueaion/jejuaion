// script.js
const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwbEZdoGureOw1zW63vgk41QKz5l_uJx3DShQOQVdEH4Q3-hk2onTfjG7TYIxNuFCw/exec";

const form = document.getElementById("reservationForm");
const statusEl = document.getElementById("status");

function setStatus(msg, type = "info") {
  if (!statusEl) return;
  statusEl.textContent = msg;
  statusEl.dataset.type = type; // CSS에서 색 바꾸기용
}

form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fd = new FormData(form);

  // ✅ Apps Script(시트 헤더)와 "키"를 맞춰서 보내기
  // 시트 헤더: createdAt, program, date, time, mode, org, name, phone, email
  const payload = {
    // form에서 가져오기
    name: (fd.get("name") || "").toString().trim(),
    phone: (fd.get("phone") || "").toString().trim(),
    email: (fd.get("email") || "").toString().trim(),

    // ✅ HTML에선 lecture지만, GAS는 program을 기대하므로 매핑
    program: (fd.get("lecture") || "").toString().trim(),

    date: (fd.get("date") || "").toString().trim(),
    time: (fd.get("time") || "").toString().trim(),

    // 지금 HTML에는 mode/org 입력이 없으니 일단 빈값으로 전송
    mode: "",
    org: "",
  };

  // 필수값 체크(프론트에서 1차 방어)
  if (!payload.name || !payload.phone || !payload.program || !payload.date || !payload.time) {
    setStatus("필수 항목을 모두 입력해 주세요. (이름/연락처/강의/날짜/시간)", "error");
    return;
  }

  setStatus("전송 중입니다...", "info");

  try {
    // ✅ 가장 호환성 좋은 방식: x-www-form-urlencoded
    const body = new URLSearchParams(payload);

    const res = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      body,
    });

    // no-cors를 쓰면 응답을 읽을 수 없어서 res.ok 판단 불가
    // 지금은 ok를 시도해보고, 실패해도 안내 메시지 출력
    if (res.ok) {
      setStatus("✅ 신청이 완료되었습니다! 스프레드시트를 확인해 주세요.", "success");
      form.reset();
    } else {
      setStatus("⚠️ 전송은 되었을 수 있어요. 스프레드시트에 들어왔는지 확인해 주세요.", "warn");
    }
  } catch (err) {
    console.error(err);
    setStatus("❌ 전송 중 오류가 발생했습니다. (F12 콘솔 확인)", "error");
  }
});
