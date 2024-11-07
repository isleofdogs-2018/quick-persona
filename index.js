import {
	animation_duration,
	eventSource,
	event_types,
} from "../../../../script.js";
import { power_user } from "../../../power-user.js";
import {
	retriggerFirstMessageOnEmptyChat,
	getUserAvatar,
	getUserAvatars,
	setUserAvatar,
	user_avatar,
} from "../../../personas.js";

let popper = null;
let isOpen = false;

function addQuickPersonaButton() {
	const quickPersonaButton = `
    <div id="quickPersona" class="interactable" tabindex="0">
        <img id="quickPersonaImg" src="/img/ai4.png" />
        <div id="quickPersonaCaret" class="fa-fw fa-solid fa-caret-up"></div>
    </div>`;
	// new container for the quick persona button
	$("#quickPersonaSection").append(quickPersonaButton);

	$("#quickPersona").on("click", () => {
		toggleQuickPersonaSelector();
	});
}

async function toggleQuickPersonaSelector() {
	if (isOpen) {
		closeQuickPersonaSelector();
		return;
	}
	await openQuickPersonaSelector();
}

async function openQuickPersonaSelector() {
	isOpen = true;
	const userAvatars = await getUserAvatars(false);
	const quickPersonaList = $(
		'<div id="quickPersonaMenu"><ul class="list-group"></ul></div>'
	);
	for (const userAvatar of userAvatars) {
		const imgUrl = `${getUserAvatar(userAvatar)}?t=${Date.now()}`;
		const imgTitle = power_user.personas[userAvatar] || userAvatar;
		const isSelected = userAvatar === user_avatar;
		const isDefault = userAvatar === power_user.default_persona;
		const listItem = $(
			'<li tabindex="0" class="list-group-item interactable"><img class="quickPersonaMenuImg"/></li>'
		);
		listItem
			.find("img")
			.attr("src", imgUrl)
			.attr("title", imgTitle)
			.toggleClass("selected", isSelected)
			.toggleClass("default", isDefault);
		listItem.on("click", () => {
			closeQuickPersonaSelector();
			setUserAvatar(userAvatar);
			changeQuickPersona();
			retriggerFirstMessageOnEmptyChat();
		});
		quickPersonaList.find("ul").append(listItem);
	}
	quickPersonaList.hide();
	$(document.body).append(quickPersonaList);
	$("#quickPersonaCaret").toggleClass("fa-caret-up fa-caret-down");
	$("#quickPersonaMenu").fadeIn(animation_duration);
	popper = Popper.createPopper(
		document.getElementById("quickPersona"),
		document.getElementById("quickPersonaMenu"),
		{
			placement: "top-start",
		}
	);
	popper.update();
}

function closeQuickPersonaSelector() {
	isOpen = false;
	$("#quickPersonaCaret").toggleClass("fa-caret-up fa-caret-down");
	$("#quickPersonaMenu").fadeOut(animation_duration, () => {
		$("#quickPersonaMenu").remove();
	});
	popper.destroy();
}

function changeQuickPersona() {
	setTimeout(() => {
		const imgUrl = `${getUserAvatar(user_avatar)}?t=${Date.now()}`;
		const imgTitle = power_user.personas[user_avatar] || user_avatar;
		$("#quickPersonaImg").attr("src", imgUrl).attr("title", imgTitle);
	}, 100);
}

jQuery(() => {
	addQuickPersonaButton();
	eventSource.on(event_types.CHAT_CHANGED, changeQuickPersona);
	eventSource.on(event_types.SETTINGS_UPDATED, changeQuickPersona);
	$(document.body).on("click", (e) => {
		if (
			isOpen &&
			!e.target.closest("#quickPersonaMenu") &&
			!e.target.closest("#quickPersona")
		) {
			closeQuickPersonaSelector();
		}
	});
	changeQuickPersona();
});
