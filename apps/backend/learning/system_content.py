from utils.hash_utils import deterministic_hash

from learning.system_models import (
    LearningExercise,
    LearningItem,
    LearningLesson,
    LearningSystemLevel,
    LearningSystemModule,
)


def _exercise(
    *,
    exercise_id: str,
    title: str,
    prompt: str,
    input_mode: str,
    options: list[str],
    expected_answer: str,
    explanation: str,
):
    return LearningExercise(
        id=exercise_id,
        title=title,
        prompt=prompt,
        input_mode=input_mode,
        options=options,
        expected_answer=expected_answer,
        explanation=explanation,
        deterministic_key=deterministic_hash(
            {
                "exercise_id": exercise_id,
                "expected_answer": expected_answer,
                "input_mode": input_mode,
                "options": options,
                "prompt": prompt,
                "title": title,
            }
        ),
    )


LEARNING_LEVELS = [
    LearningSystemLevel(
        id="level-a1-foundations",
        title="Foundations",
        cefr="A1",
        description="Build stable everyday Finnish for routines, identity, and basic questions.",
        modules=[
            LearningSystemModule(
                id="module-a1-routines",
                title="Daily Routines",
                description="Present-tense routines and time anchors for simple daily answers.",
                level_id="level-a1-foundations",
                level_label="A1",
                lessons=[
                    LearningLesson(
                        id="lesson-a1-present-routines",
                        title="Present tense for routines",
                        summary="Describe what you do every day with clear present-tense verbs.",
                        explanation=(
                            "Finnish uses the present tense for routines, habits, and actions that are true now. "
                            "Start with the subject, then choose the matching verb form."
                        ),
                        examples=[
                            "Mina asun Espoossa ja opiskelen suomea iltaisin.",
                            "Han menee toihin bussilla joka aamu.",
                        ],
                        items=[
                            LearningItem(
                                id="a1-routines-item-1",
                                label="Focus",
                                value="Match the verb ending to the subject.",
                            ),
                            LearningItem(
                                id="a1-routines-item-2",
                                label="Pattern",
                                value="mina puhun, sina puhut, han puhuu",
                            ),
                        ],
                        exercises=[
                            _exercise(
                                exercise_id="exercise-a1-routines-1",
                                title="Verb form check",
                                prompt="Complete the sentence: Mina ___ suomea joka paiva.",
                                input_mode="text",
                                options=[],
                                expected_answer="opiskelen",
                                explanation=(
                                    "'Opiskelen' matches the first-person singular subject 'mina'."
                                ),
                            )
                        ],
                    ),
                    LearningLesson(
                        id="lesson-a1-time-anchors",
                        title="Time words in routine answers",
                        summary="Anchor actions with words such as tanaan, aamulla, and illalla.",
                        explanation=(
                            "Time words make simple answers easier to follow. Place them near the verb or at the "
                            "start of the sentence when you want to frame the action clearly."
                        ),
                        examples=[
                            "Heraan aamulla kello kuusi.",
                            "Illalla teen ruokaa ja lepaan kotona.",
                        ],
                        items=[
                            LearningItem(
                                id="a1-time-item-1",
                                label="Focus",
                                value="Use one time anchor per short answer.",
                            ),
                            LearningItem(
                                id="a1-time-item-2",
                                label="Useful words",
                                value="aamulla, paivalla, illalla, tanaan, huomenna",
                            ),
                        ],
                        exercises=[
                            _exercise(
                                exercise_id="exercise-a1-time-1",
                                title="Choose the time word",
                                prompt="Choose the best completion: ___ menen kirjastoon tyopaivan jalkeen.",
                                input_mode="choice",
                                options=["Illalla", "Eilen", "Talossa"],
                                expected_answer="Illalla",
                                explanation=(
                                    "'Illalla' fits the idea of going after the workday."
                                ),
                            )
                        ],
                    ),
                ],
            )
        ],
    ),
    LearningSystemLevel(
        id="level-a2-navigation",
        title="Navigation",
        cefr="A2",
        description="Handle directions and service interactions with location language.",
        modules=[
            LearningSystemModule(
                id="module-a2-places",
                title="Places and Directions",
                description="Use place words, local cases, and polite service questions.",
                level_id="level-a2-navigation",
                level_label="A2",
                lessons=[
                    LearningLesson(
                        id="lesson-a2-local-cases",
                        title="Local cases for place",
                        summary="Talk about where something is and where someone goes.",
                        explanation=(
                            "Finnish local cases help you show location and movement. Start by learning common place "
                            "phrases instead of trying to memorize every case in isolation."
                        ),
                        examples=[
                            "Kirjasto on aseman lahella.",
                            "Menen kirjastoon bussilla.",
                        ],
                        items=[
                            LearningItem(
                                id="a2-local-item-1",
                                label="Location",
                                value="asemalla means at the station",
                            ),
                            LearningItem(
                                id="a2-local-item-2",
                                label="Direction",
                                value="asemalle means to the station area",
                            ),
                        ],
                        exercises=[
                            _exercise(
                                exercise_id="exercise-a2-local-1",
                                title="Select the best answer",
                                prompt="Choose the best question for finding a place.",
                                input_mode="choice",
                                options=[
                                    "Missa asema on?",
                                    "Mina asema olen?",
                                    "Asema missa menee?",
                                ],
                                expected_answer="Missa asema on?",
                                explanation=(
                                    "'Missa asema on?' is the natural question for asking where the station is."
                                ),
                            )
                        ],
                    ),
                    LearningLesson(
                        id="lesson-a2-service-dialogue",
                        title="Short service dialogue",
                        summary="Ask for help politely and keep the answer easy to follow.",
                        explanation=(
                            "In service situations, a short polite question plus one location phrase is often enough. "
                            "Keep the structure stable so the listener can react quickly."
                        ),
                        examples=[
                            "Anteeksi, missa kirjasto on?",
                            "Se on torin vieressa, apteekin takana.",
                        ],
                        items=[
                            LearningItem(
                                id="a2-service-item-1",
                                label="Opening",
                                value="Anteeksi softens the request.",
                            ),
                            LearningItem(
                                id="a2-service-item-2",
                                label="Direction cue",
                                value="vieressa and takana give a clear reference point.",
                            ),
                        ],
                        exercises=[
                            _exercise(
                                exercise_id="exercise-a2-service-1",
                                title="Polite request",
                                prompt="Complete the opening: ___, missa kirjasto on?",
                                input_mode="text",
                                options=[],
                                expected_answer="Anteeksi",
                                explanation=(
                                    "'Anteeksi' is a standard polite opening in a service encounter."
                                ),
                            )
                        ],
                    ),
                ],
            )
        ],
    ),
    LearningSystemLevel(
        id="level-b1-work",
        title="Work and Study",
        cefr="B1",
        description="Give clearer requests and explanations in work or study settings.",
        modules=[
            LearningSystemModule(
                id="module-b1-requests",
                title="Requests and Explanations",
                description="Write or say clear schedule requests with reasons and outcomes.",
                level_id="level-b1-work",
                level_label="B1",
                lessons=[
                    LearningLesson(
                        id="lesson-b1-email-request",
                        title="Simple email request",
                        summary="Make a request, give a reason, and propose the next step.",
                        explanation=(
                            "A useful work message has three parts: the request, the reason, and the proposed next "
                            "step. This keeps the message polite and easy to answer."
                        ),
                        examples=[
                            "Voinko siirtaa kokousta huomiseen, koska olen laakarissa?",
                            "Lahetan paivitetyn aikataulun iltapaivalla.",
                        ],
                        items=[
                            LearningItem(
                                id="b1-email-item-1",
                                label="Request",
                                value="Voinko siirtaa kokousta huomiseen?",
                            ),
                            LearningItem(
                                id="b1-email-item-2",
                                label="Reason",
                                value="koska olen laakarissa",
                            ),
                        ],
                        exercises=[
                            _exercise(
                                exercise_id="exercise-b1-email-1",
                                title="Reason connector",
                                prompt="Choose the best connector: Tarvitsen uuden ajan, ___ olen poissa aamulla.",
                                input_mode="choice",
                                options=["koska", "mutta", "joskus"],
                                expected_answer="koska",
                                explanation=(
                                    "'Koska' introduces the reason for the request."
                                ),
                            )
                        ],
                    ),
                    LearningLesson(
                        id="lesson-b1-object-choices",
                        title="Object choices in practical messages",
                        summary="Choose the object form that matches a complete or incomplete action.",
                        explanation=(
                            "Object choice depends on whether the action is complete, incomplete, or negative. "
                            "In practical messages, this helps you sound precise."
                        ),
                        examples=[
                            "Lahetin sahkopostin opettajalle.",
                            "En viela lahettanyt hakemusta.",
                        ],
                        items=[
                            LearningItem(
                                id="b1-object-item-1",
                                label="Complete action",
                                value="Lahetin sahkopostin.",
                            ),
                            LearningItem(
                                id="b1-object-item-2",
                                label="Negative action",
                                value="En lahettanyt hakemusta.",
                            ),
                        ],
                        exercises=[
                            _exercise(
                                exercise_id="exercise-b1-object-1",
                                title="Object form choice",
                                prompt="Choose the better sentence for a completed action.",
                                input_mode="choice",
                                options=[
                                    "Lahetin viestin esihenkilolle.",
                                    "En lahettanyt viestia esihenkilolle.",
                                ],
                                expected_answer="Lahetin viestin esihenkilolle.",
                                explanation=(
                                    "The first option describes a completed action."
                                ),
                            )
                        ],
                    ),
                ],
            )
        ],
    ),
]
