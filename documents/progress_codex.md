# Codex Progress Log

## Recent additions
- Added UI components with animations (VocabCard, GrammarBiteCard, MiniChallengeCard, UserBubble, XPBadge, StreakFlame, AnimatedCTA, FlashcardImage, ConversationHeader).
- Added navigation scaffolding (`frontend/app/navigation/*`) with linking config and main stack/tab structure.
- Added new screens: VocabScreen, GrammarBiteScreen, MiniChallengeScreen, StreakRewardScreen, SettingsScreen, ProgressScreen, PersonalizedPlanScreen.
- Added audio/WS scaffolds (`useAudioRecorder`, `sttService`, `useConversationSocket`, `MicButton`).
- Added design tokens, animation hooks, Zustand stores, notifications hook/screen.
- Swapped the app to use the new navigation architecture (AppNavigator + MainStack + TabNavigator) with theme-aware NavigationContainer and full stack routes so Recharge/Conversation/Workplace/notifications/subscription flows sit on the new UI shell.
- Backend hotfix: added `calculate_xp_reward` stub to engagement_service to unblock uvicorn import errors; engagement router works again.
- npm install in frontend failed due to restricted network (EAI_AGAIN) when fetching react-native-reanimated; install once network is available.
- ConversationScreen now uses `useAudioRecorder` + `transcribeAudio` + `useConversationSocket` with MicButton UI, status badges, and store persistence for messages.
- Backend startup now auto-creates tables (dev convenience) and recharge router imports `select` explicitly to avoid runtime NameError.
- Added WebSocket endpoint `/ws/conversation/{user_id}` with subscription gating and conversation engine reply streaming; included router in main.
- Added Jest harness for frontend with react-native preset, tests for VocabCard/TutorBubble, AsyncStorage/reanimated mocks, and passing test run (`npm test -- --runInBand`).
- Added Alembic scaffold (alembic.ini, env.py, script.py.mako) and initial migration `0001_initial.py` creating users, grammar_logs, pronunciation_logs, usage_logs, daily_recharge, user_daily_state, recharge_history tables.
- Fixed Alembic env to include backend path on sys.path so `alembic upgrade head` runs without ModuleNotFoundError.
- Enhanced theme system (light/dark with gradients), added animation hooks (hero wave, press scale, parallax, bottom sheet, stagger fade, progress sweep), progress ring component, sound hook, and added premium-feel animations to bubbles and mic (pulse ring, appear/bounce).
- Added ambient soundscape scaffolding (presets + controller hook) and wired into ConversationScreen (volume reacts to user/AI speaking). Added premium ConversationScreen layout with ambient clouds, breathing VoiceOrb, mic pulse, recorder/STT/WebSocket fallback.
- Added reusable BottomSheet component with gesture/snap physics and dim overlay.
- Added SkillOrb component and rendered sample skill orbs in OrbGardenScreen; SkillTree placeholder routed in navigation.
- Added SceneBackground component with animated aurora/forest/lapland overlays (brightness, shimmer, haze, parallax) and integrated it into ConversationScreen.
- Added GPU-style effect scaffolds: aurora voice-reactive overlay, snowfall, fog reactive to amplitude, starfield; orb overlay snow + evolution burst; seasonal manager stub; integrated amplitude/season props into SceneBackground/VoiceOrb.

## Recent additions (continued)
- ✅ Wired audio recorder + STT + WebSocket into ConversationScreen:
  - Integrated `useAudioRecorder` hook for start/stop recording
  - Integrated `transcribeAudio` service to convert audio to text
  - Integrated `useConversationSocket` hook for real-time messaging
  - Updated `handleMicPressIn` to start recording with error handling
  - Updated `handleMicPressOut` to stop recording, transcribe, and send via WebSocket (with HTTP fallback)
  - Updated `handleSend` to use WebSocket when connected (with HTTP fallback)
  - Added WebSocket message syncing to local state with deduplication
  - Enhanced `useConversationSocket` to add message IDs and send proper payload format (level, path, etc.)

## Recent additions (continued)
- ✅ Wired audio recorder + STT into RoleplayScreen:
  - Replaced MicRecorder component with MicButton + useAudioRecorder hook
  - Integrated transcribeAudio service for voice-to-text conversion
  - Added handleMicPressIn/Out handlers with error handling
  - Added transcription state and loading indicators
  - Updated UI to show transcription status
  - Maintained existing evaluation flow (no WebSocket needed for one-time evaluation)
- ✅ Renamed app from PUHIS to RUKA:
  - Updated package.json (name: "ruka-frontend")
  - Updated app.json (name: "RUKA", slug: "ruka")
  - Updated README.md and backend main.py API title
  - Updated all screen references (SettingsScreen, RechargeScreen)
  - Updated navigation linking prefixes (ruka://)
  - Updated certificate verification codes (RUKA-2024-001)
- ✅ Implemented scene-based background system:
  - Created SceneBackground component with aurora/forest/lapland scenes
  - Updated ConversationScreen → aurora scene (with amplitude/season props)
  - Updated HomeScreen, RechargeScreen, PathSelectionScreen → forest scene
  - Updated SkillTreeScreen, PronunciationLabScreen, TeacherDashboardScreen, GrammarBiteScreen, CertificateListScreen, CertificateDetailScreen → lapland scene
  - All screens now use SceneBackground with proper scene assignments and orbEmotion props

## Recent additions (continued)
- ✅ Completed YKI Writing Exam Screen:
  - Full writing exam interface with multiple tasks
  - Per-task timers with countdown
  - Real-time word count tracking with visual feedback
  - Task navigation (prev/next)
  - Progress indicators for all tasks
  - Submission with validation and warnings
  - Integration with backend YKI exam service
  - SceneBackground integration (lapland scene)
- ✅ Created OnboardingScreen:
  - Multi-step onboarding flow
  - Path selection (General Finnish, Workplace, YKI)
  - Progress indicators
  - SceneBackground integration (forest scene)
  - Navigation integration
- ✅ Implemented Authentication System:
  - Backend: Auth router with JWT tokens (login, register, refresh, /me)
  - Backend: Updated User model with password_hash and name fields
  - Backend: Auth utilities (hash_password, verify_password, create_access_token, create_refresh_token)
  - Frontend: AuthContext with persistent auth state (AsyncStorage)
  - Frontend: AuthService for API calls (login, register, refresh, getCurrentUser)
  - Frontend: LoginScreen and RegisterScreen with SceneBackground
  - Frontend: Updated API utility to use auth tokens and get user ID from auth context
  - Frontend: Updated App.js to conditionally show auth screens vs main app
  - Frontend: Auto-refresh token mechanism (every 25 minutes)
  - All API calls now use authenticated user ID instead of DEFAULT_USER_ID stub
- ✅ Implemented Stripe Payment Integration:
  - Backend: Stripe service with checkout session creation and webhook handling
  - Backend: Payments router (/payments/create-checkout, /payments/create-portal, /payments/webhook)
  - Backend: Added stripe to requirements.txt
  - Frontend: Updated SubscriptionScreen to use Stripe checkout sessions
  - Frontend: Added createCheckoutSession and createPortalSession API functions
  - Frontend: Payment flow with deep linking support (ruka:// URLs)
  - Frontend: "Manage Subscription" button for existing subscribers
  - Webhook handling for subscription events (created, updated, cancelled, payment succeeded/failed)

## Recent additions (continued)
- ✅ Added logout functionality to SettingsScreen
- ✅ Created Alembic migration for auth fields (password_hash, name)
- ✅ Subscription enforcement already integrated in conversation_socket and other routers
- ✅ Phase 2: Advanced Engines Implementation:
  - Enhanced Progressive Disclosure Engine v3 with ML-based difficulty prediction
  - Updated Conversation Engine v4 to use Progressive Disclosure v3
  - Updated conversation_socket router to use Conversation Engine v4
  - Updated progressive_disclosure router to use v3 engine with ML features
  - Added text complexity estimation to Conversation Engine v4
  - Enhanced support level computation with error pattern recognition
  - Added difficulty recommendation system based on performance trends

## UI Architecture Refactor - New Foundation
- ✅ Created TypeScript navigation structure:
  - RootNavigator with Drawer navigation
  - MainTabs with bottom tab navigation
  - ConversationStack for conversation flow
- ✅ Created RukaTheme (dark theme inspired by northern Finland)
- ✅ Created useRukaStore Zustand store for app-wide state (amplitude, mood)
- ✅ Created Skia-based components:
  - VoiceOrb with animated pulse and amplitude reactivity
  - AuroraLayer with animated gradient shader
  - SceneBackground with aurora overlay
  - VoiceInputIndicator for voice level display
- ✅ Integrated new components into existing screens:
  - HomeScreen now shows VoiceOrb
  - ConversationScreen shows VoiceInputIndicator
  - Both screens use new SceneBackground with aurora
- ✅ Updated App.js to include GestureHandlerRootView
- ✅ Created TypeScript configuration

## Phase 2 Progress
- ✅ Enhanced Progressive Disclosure Engine v3 with ML-based difficulty prediction
  - Feature extraction (accuracy, trend, error consistency, hesitation, complexity)
  - Weighted feature combination for support level prediction
  - Performance history tracking per user
  - Difficulty recommendation system
  - Context-aware text masking
- ✅ Updated Conversation Engine v4 integration
  - Now uses Progressive Disclosure v3
  - Text complexity estimation
  - Context-aware masking with error types
  - Enhanced support level computation
- ✅ Updated routers to use v4 engines
  - conversation_socket uses Conversation Engine v4
  - progressive_disclosure router uses v3 with ML features
  - Backward compatible API with enhanced features

## Pending / next steps
- Test Phase 2 improvements (ML-based progressive disclosure, enhanced conversation engine)
- Enhance Pronunciation Engine v2 integration (already exists, ensure it's used)
- Enhance Personalization Engine v2 (already exists, ensure it's used)
- Test authentication flow (login, register, token refresh)
- Test Stripe payment flow (checkout session creation and webhook handling)
- Set up Stripe account and configure price IDs in environment variables
- Add database persistence for subscriptions (currently in-memory)
- Configure Expo notifications & Reanimated if not already set up
- Create OrbStoryScreen and OrbEvolutionEvents screens if needed
- Phase 3: B2B Platform features (Admin/Teacher dashboards, cohort analytics)
