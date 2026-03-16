// ============================================================================
// CareMate – Expo Snack Version (single-file)
// Kopiér hele denne fil ind i App.js på snack.expo.dev
//
// Dependencies der skal tilføjes i Snack:
//   @react-navigation/native
//   @react-navigation/bottom-tabs
//   @react-navigation/native-stack
//   react-native-screens
//   react-native-safe-area-context
//   @react-native-async-storage/async-storage
// ============================================================================

import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform, Alert, Switch,
  Modal, Animated, Linking,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// THEME
// ============================================================================

const colors = {
  primary: '#2E7D6F',
  primaryLight: '#E8F5F1',
  secondary: '#5C6BC0',
  danger: '#D32F2F',
  dangerLight: '#FFEBEE',
  warning: '#F9A825',
  warningLight: '#FFF8E1',
  text: '#212121',
  textSecondary: '#616161',
  background: '#FAFAFA',
  white: '#FFFFFF',
  border: '#E0E0E0',
  shadow: '#00000020',
  chatBubbleUser: '#2E7D6F',
  chatBubbleAI: '#F0F0F0',
};

const sp = { xs: 6, sm: 12, md: 20, lg: 28, xl: 40, xxl: 56 };
const br = { sm: 8, md: 12, lg: 16, xl: 24, full: 999 };

const typ = StyleSheet.create({
  h1: { fontSize: 36, fontWeight: '700', color: colors.text, lineHeight: 46 },
  h2: { fontSize: 30, fontWeight: '600', color: colors.text, lineHeight: 40 },
  h3: { fontSize: 26, fontWeight: '600', color: colors.text, lineHeight: 34 },
  body: { fontSize: 22, fontWeight: '400', color: colors.text, lineHeight: 32 },
  bodySmall: { fontSize: 20, fontWeight: '400', color: colors.textSecondary, lineHeight: 28 },
  button: { fontSize: 24, fontWeight: '600', lineHeight: 32 },
  caption: { fontSize: 18, fontWeight: '400', color: colors.textSecondary, lineHeight: 26 },
});

// ============================================================================
// MODELS
// ============================================================================

const DEFAULT_SETTINGS = {
  largeText: false, highContrast: false,
  medicineReminders: true, checkInReminders: true,
  checkInReminderTime: '09:00', voiceControlEnabled: false,
  emergencyMessage: 'Jeg har brug for hjælp. Send venligst nogen.',
};

// ============================================================================
// STORAGE: MEDICINE
// ============================================================================

const MED_KEY = '@caremate_medicines';
const LOG_KEY = '@caremate_medicine_log';

const STATUS = {
  upcoming: { key: 'upcoming', label: 'Kommer snart', icon: 'time-outline', color: '#5C6BC0', lightColor: '#E8EAF6' },
  taken: { key: 'taken', label: 'Taget', icon: 'checkmark-circle', color: '#2E7D6F', lightColor: '#E8F5F1' },
  missed: { key: 'missed', label: 'Ikke registreret', icon: 'alert-circle-outline', color: '#F9A825', lightColor: '#FFF8E1' },
};

function getMedicineStatus(med, log) {
  if (log.some((l) => l.medicineId === med.id)) return STATUS.taken;
  const now = new Date();
  const [h, m] = med.time.split(':').map(Number);
  const sched = new Date(); sched.setHours(h, m, 0, 0);
  if (now.getTime() < sched.getTime() + 30 * 60000) return STATUS.upcoming;
  return STATUS.missed;
}

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
function getToday() { return new Date().toISOString().split('T')[0]; }

const DEFAULT_MEDS = [
  { id: 'med_1', name: 'Hjertemedicin', time: '08:00', dosage: '1 tablet', notes: null, active: true, createdAt: '2026-01-15T08:00:00Z' },
  { id: 'med_2', name: 'Blodtrykspille', time: '12:00', dosage: '1 tablet', notes: 'Tag med mad', active: true, createdAt: '2026-01-15T08:00:00Z' },
  { id: 'med_3', name: 'Vitaminer', time: '18:00', dosage: '2 tabletter', notes: null, active: true, createdAt: '2026-02-01T08:00:00Z' },
];

async function seedMedicineData() {
  try { const r = await AsyncStorage.getItem(MED_KEY); if (!r || JSON.parse(r).length === 0) await AsyncStorage.setItem(MED_KEY, JSON.stringify(DEFAULT_MEDS)); } catch {}
}
async function getAllMedicines() {
  try { const r = await AsyncStorage.getItem(MED_KEY); return (r ? JSON.parse(r) : []).filter(m => m.active).sort((a,b) => a.time.localeCompare(b.time)); } catch { return []; }
}
async function getTodayLog() {
  try { const r = await AsyncStorage.getItem(LOG_KEY); return (r ? JSON.parse(r) : []).filter(l => l.date === getToday()); } catch { return []; }
}
async function markMedicineTaken(id) {
  try { const r = await AsyncStorage.getItem(LOG_KEY); const logs = r ? JSON.parse(r) : []; const today = getToday(); if (logs.some(l => l.medicineId===id && l.date===today)) return; logs.push({ id: genId(), medicineId: id, date: today, takenAt: new Date().toISOString() }); await AsyncStorage.setItem(LOG_KEY, JSON.stringify(logs)); } catch {}
}
async function unmarkMedicineTaken(id) {
  try { const r = await AsyncStorage.getItem(LOG_KEY); const logs = r ? JSON.parse(r) : []; const today = getToday(); await AsyncStorage.setItem(LOG_KEY, JSON.stringify(logs.filter(l => !(l.medicineId===id && l.date===today)))); } catch {}
}
async function addMedicine(name, time, dosage) {
  const meds = await getAllMedicines(); meds.push({ id: genId(), name: name.trim(), time: time.trim(), dosage: dosage?.trim()||null, notes: null, active: true, createdAt: new Date().toISOString() }); await AsyncStorage.setItem(MED_KEY, JSON.stringify(meds));
}
async function removeMedicine(id) {
  try { const r = await AsyncStorage.getItem(MED_KEY); const meds = r ? JSON.parse(r) : []; await AsyncStorage.setItem(MED_KEY, JSON.stringify(meds.map(m => m.id===id ? {...m, active:false} : m))); } catch {}
}

// ============================================================================
// STORAGE: CHECK-IN
// ============================================================================

const CI_KEY = '@caremate_checkins';

const MOODS = {
  good: { key: 'good', label: 'Godt', emoji: '😊', color: '#4CAF50', lightColor: '#E8F5E9' },
  okay: { key: 'okay', label: 'Okay', emoji: '😐', color: '#FF9800', lightColor: '#FFF3E0' },
  not_good: { key: 'not_good', label: 'Ikke så godt', emoji: '😔', color: '#E57373', lightColor: '#FFEBEE' },
};

async function getAllCheckIns() { try { const r = await AsyncStorage.getItem(CI_KEY); return (r ? JSON.parse(r) : []).sort((a,b) => b.date.localeCompare(a.date)); } catch { return []; } }
async function saveCheckIn(mood, note) { const entries = await getAllCheckIns(); const today = getToday(); const filtered = entries.filter(e => e.date !== today); const entry = { id: genId(), date: today, mood, note: note?.trim()||null, createdAt: new Date().toISOString() }; filtered.unshift(entry); await AsyncStorage.setItem(CI_KEY, JSON.stringify(filtered)); return entry; }
async function getTodayCheckIn() { return (await getAllCheckIns()).find(e => e.date === getToday()) || null; }
async function getRecentCheckIns(n=7) { return (await getAllCheckIns()).slice(0, n); }
async function getConsecutiveMoodStreak(target) { const entries = await getAllCheckIns(); let streak = 0; const today = new Date(); for (let i=0; i<entries.length; i++) { const exp = new Date(today); exp.setDate(exp.getDate()-i); if (entries[i].date !== exp.toISOString().split('T')[0]) break; if (entries[i].mood !== target) break; streak++; } return streak; }
async function seedMockData() { const e = await getAllCheckIns(); if (e.length > 0) return; const pattern = ['good','good','okay','good','not_good','okay','good','good','okay','not_good','good','okay','good','good']; const notes = ['Gik en dejlig tur',null,'Lidt ondt i knæet',null,'Sov godt',null,'Besøg af naboen',null,'Savnede familien',null,'Læste en god bog',null,'Godt vejr',null]; const entries = []; const today = new Date(); for (let i=13; i>=1; i--) { const d = new Date(today); d.setDate(d.getDate()-i); entries.push({ id: genId(), date: d.toISOString().split('T')[0], mood: pattern[13-i]||'okay', note: notes[13-i]||null, createdAt: d.toISOString() }); } await AsyncStorage.setItem(CI_KEY, JSON.stringify(entries)); }

// ============================================================================
// CHAT SERVICE
// ============================================================================

const SUGGESTIONS = [
  { id: 'schedule', text: 'Hvad skal jeg i dag?', icon: 'calendar-outline' },
  { id: 'medicine', text: 'Hvornår skal jeg tage min medicin?', icon: 'medkit-outline' },
  { id: 'lonely', text: 'Jeg føler mig lidt ensom', icon: 'heart-outline' },
  { id: 'call', text: 'Ring til min datter', icon: 'call-outline' },
];

const WELCOME_MSG = { id: 'welcome', text: 'Hej! Jeg er CareMate, din digitale hjælper.\n\nDu kan skrive til mig, eller vælge et af forslagene herunder.', sender: 'ai' };

const RESPONSES = [
  { kw: ['hej','godmorgen','god dag'], reply: 'Hej med dig! Hvad kan jeg hjælpe med i dag?' },
  { kw: ['hvad skal jeg i dag','plan','kalender'], reply: 'I dag har du ingen særlige aftaler. Det kunne være en god dag til en rolig gåtur.\n\nSkal jeg hjælpe med noget andet?' },
  { kw: ['medicin','pille','tablet'], reply: 'Du kan se dine medicinpåmindelser under fanen "Medicin".\n\nSkal jeg hjælpe med noget andet?' },
  { kw: ['ensom','alene','savner','ked af det'], reply: 'Det er helt okay at føle sådan.\n\nMåske kunne det hjælpe at ringe til nogen du holder af? Du finder dine kontakter under "Hjælp".' },
  { kw: ['ring','opkald','datter','søn'], reply: 'Du kan ringe til dine pårørende via fanen "Hjælp". Tryk blot på den person du vil ringe til.' },
  { kw: ['tak'], reply: 'Det var så lidt! Jeg er altid her, hvis du har brug for hjælp.' },
  { kw: ['hjælp','hvad kan du'], reply: 'Jeg kan hjælpe med:\n\n• Minde dig om medicin\n• Fortælle om din dag\n• Hjælpe dig ringe til nogen\n• Bare snakke\n\nSpørg bare løs!' },
];

function getMockReply(text) {
  const lower = text.toLowerCase(); let best = null, bestScore = 0;
  for (const e of RESPONSES) { let score = 0; for (const k of e.kw) { if (lower.includes(k)) score += k.length; } if (score > bestScore) { bestScore = score; best = e; } }
  return best ? best.reply : 'Tak for din besked. Prøv evt. at vælge et af forslagene. Jeg er her for at hjælpe.';
}

async function sendChatMessage(text) { await new Promise(r => setTimeout(r, 400 + Math.random()*500)); return getMockReply(text); }
function createMsg(text, sender) { return { id: genId(), text, sender, timestamp: new Date().toISOString() }; }

// ============================================================================
// SHARED COMPONENTS
// ============================================================================

function ScreenWrapper({ title, children, scrollable = true }) {
  const Content = scrollable ? ScrollView : View;
  return (
    <SafeAreaView style={{ flex:1, backgroundColor: colors.background }} edges={['top']}>
      {title && <View style={{ paddingHorizontal: sp.lg, paddingTop: sp.lg, paddingBottom: sp.md }}><Text style={typ.h1}>{title}</Text></View>}
      <Content style={{ flex:1 }} contentContainerStyle={scrollable ? { paddingHorizontal: sp.lg, paddingBottom: sp.xxl } : { flex:1, paddingHorizontal: sp.lg }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">{children}</Content>
    </SafeAreaView>
  );
}

function BigButton({ title, onPress, icon, variant='primary', style }) {
  const bg = { primary: colors.primary, danger: colors.danger, secondary: colors.white }[variant];
  const tc = variant==='secondary' ? colors.primary : colors.white;
  return (
    <TouchableOpacity style={[{ flexDirection:'row', alignItems:'center', justifyContent:'center', paddingVertical:sp.lg, paddingHorizontal:sp.xl, borderRadius:br.xl, minHeight:72, backgroundColor:bg, elevation:2, borderWidth: variant==='secondary'?2:0, borderColor: variant==='secondary'?colors.primary:'transparent' }, style]} onPress={onPress} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel={title}>
      {icon && <Ionicons name={icon} size={30} color={tc} style={{ marginRight: sp.sm }} />}
      <Text style={[typ.button, { color: tc }]}>{title}</Text>
    </TouchableOpacity>
  );
}

function MedicineCard({ name, time, dosage, status, onTake, onUndo, onLongPress }) {
  const isTaken = status.key === 'taken';
  return (
    <View style={{ backgroundColor: isTaken ? '#F8FBF9' : colors.white, borderRadius: br.xl, padding: sp.lg, marginBottom: sp.lg, elevation: isTaken?1:2 }}>
      <View style={{ flexDirection:'row', alignItems:'center', alignSelf:'flex-start', borderRadius:br.full, paddingHorizontal:sp.md, paddingVertical:sp.xs, backgroundColor:status.lightColor, marginBottom:sp.md }}>
        <Ionicons name={status.icon} size={22} color={status.color} />
        <Text style={{ fontSize:18, fontWeight:'600', marginLeft:sp.xs, color:status.color }}>{status.label}</Text>
      </View>
      <View style={{ flexDirection:'row', alignItems:'center', marginBottom:sp.lg }}>
        <View style={{ width:64, height:64, borderRadius:br.full, alignItems:'center', justifyContent:'center', backgroundColor: isTaken ? status.lightColor : colors.primaryLight, marginRight:sp.md }}>
          <Ionicons name="medkit" size={32} color={isTaken ? status.color : colors.primary} />
        </View>
        <View style={{ flex:1 }}>
          <Text style={[typ.h3, isTaken && { color: colors.textSecondary }]}>{name}</Text>
          <Text style={[typ.body, { color: colors.textSecondary, marginTop:sp.xs }]}>Kl. {time}</Text>
          {dosage && <Text style={[typ.bodySmall, { marginTop:sp.xs }]}>{dosage}</Text>}
        </View>
      </View>
      {!isTaken ? (
        <TouchableOpacity style={{ flexDirection:'row', alignItems:'center', justifyContent:'center', backgroundColor:colors.primary, borderRadius:br.xl, paddingVertical:sp.md, minHeight:64 }} onPress={onTake} onLongPress={onLongPress} activeOpacity={0.7}>
          <Ionicons name="checkmark-circle-outline" size={28} color={colors.white} />
          <Text style={{ color:colors.white, fontSize:22, fontWeight:'600', marginLeft:sp.sm }}>Jeg har taget den</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={{ flexDirection:'row', alignItems:'center', justifyContent:'center', backgroundColor:colors.primaryLight, borderRadius:br.xl, paddingVertical:sp.md, minHeight:56 }} onPress={onUndo} onLongPress={onLongPress} activeOpacity={0.7}>
          <Ionicons name="arrow-undo-outline" size={22} color={colors.primary} />
          <Text style={{ color:colors.primary, fontSize:20, fontWeight:'600', marginLeft:sp.xs }}>Fortryd</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function ContactCard({ contact, onCall, onMessage }) {
  const initials = contact.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase();
  return (
    <View style={{ backgroundColor:colors.white, borderRadius:br.lg, padding:sp.lg, marginBottom:sp.md, elevation:2 }}>
      <View style={{ flexDirection:'row', alignItems:'center', marginBottom:sp.md }}>
        <View style={{ width:60, height:60, borderRadius:br.full, backgroundColor:colors.primaryLight, alignItems:'center', justifyContent:'center', marginRight:sp.md }}>
          <Text style={{ fontSize:24, fontWeight:'700', color:colors.primary }}>{initials}</Text>
        </View>
        <View style={{ flex:1 }}>
          <Text style={typ.h3}>{contact.name}</Text>
          {contact.relation && <Text style={typ.bodySmall}>{contact.relation}</Text>}
        </View>
      </View>
      <View style={{ flexDirection:'row', gap:sp.sm }}>
        <TouchableOpacity style={{ flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', minHeight:60, borderRadius:br.xl, backgroundColor:colors.primary, gap:sp.xs }} onPress={() => onCall(contact)} activeOpacity={0.7}>
          <Ionicons name="call" size={26} color={colors.white} />
          <Text style={{ fontSize:22, fontWeight:'600', color:colors.white }}>Ring</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', minHeight:60, borderRadius:br.xl, backgroundColor:colors.primaryLight, borderWidth:1.5, borderColor:colors.primary, gap:sp.xs }} onPress={() => onMessage(contact)} activeOpacity={0.7}>
          <Ionicons name="chatbubble-outline" size={26} color={colors.primary} />
          <Text style={{ fontSize:22, fontWeight:'600', color:colors.primary }}>Besked</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function SuggestionChips({ suggestions, onSelect, visible }) {
  if (!visible) return null;
  return (
    <View style={{ paddingHorizontal:sp.lg, paddingBottom:sp.md }}>
      <Text style={[typ.bodySmall, { marginBottom:sp.sm, textAlign:'center' }]}>Prøv at spørge om:</Text>
      <View style={{ flexDirection:'row', flexWrap:'wrap', justifyContent:'center', gap:sp.sm }}>
        {suggestions.map(s => (
          <TouchableOpacity key={s.id} style={{ flexDirection:'row', alignItems:'center', backgroundColor:colors.white, borderRadius:br.xl, borderWidth:1.5, borderColor:colors.primary, paddingVertical:sp.sm, paddingHorizontal:sp.md, maxWidth:'48%', minHeight:52 }} onPress={() => onSelect(s)} activeOpacity={0.7}>
            {s.icon && <Ionicons name={s.icon} size={22} color={colors.primary} style={{ marginRight:sp.xs }} />}
            <Text style={{ fontSize:18, fontWeight:'500', color:colors.primary, flexShrink:1 }} numberOfLines={2}>{s.text}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ============================================================================
// HOME SCREEN
// ============================================================================

const DAYS = ['Søndag','Mandag','Tirsdag','Onsdag','Torsdag','Fredag','Lørdag'];
const MONTHS = ['januar','februar','marts','april','maj','juni','juli','august','september','oktober','november','december'];
function fmtDate(d) { return `${DAYS[d.getDay()]} d. ${d.getDate()}. ${MONTHS[d.getMonth()]}`; }
function getGreeting() { const h = new Date().getHours(); return h<10?'Godmorgen':h<18?'God eftermiddag':'God aften'; }

const QUICK = [
  { id:'ai', label:'AI-assistent', icon:'chatbubble-ellipses', route:'AI-assistent', isTab:true },
  { id:'med', label:'Medicin', icon:'medkit', route:'Medicin', isTab:true },
  { id:'plan', label:'Dagens plan', icon:'calendar', route:null },
  { id:'help', label:'Kontakter', icon:'people', route:'Hjælp', isTab:true },
];

function HomeScreen({ navigation }) {
  const [nextMed, setNextMed] = useState(null);
  useFocusEffect(useCallback(() => { let a=true; (async()=>{ await seedMedicineData(); const m=await getAllMedicines(); const l=await getTodayLog(); const up=m.map(x=>({...x,status:getMedicineStatus(x,l)})).filter(x=>x.status.key!=='taken').sort((x,y)=>x.time.localeCompare(y.time)); if(a) setNextMed(up[0]||null); })(); return ()=>{a=false}; }, []));
  const goTab = r => navigation.getParent()?.navigate(r);
  return (
    <ScreenWrapper>
      <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:sp.lg }}>
        <View style={{ flexDirection:'row', alignItems:'center' }}>
          <View style={{ width:44, height:44, borderRadius:22, backgroundColor:colors.primaryLight, alignItems:'center', justifyContent:'center', marginRight:14 }}>
            <Ionicons name="person" size={22} color={colors.primary} />
          </View>
          <View>
            <Text style={{ fontSize:24, fontWeight:'700', color:colors.text }}>{getGreeting()}</Text>
            <Text style={{ fontSize:16, color:colors.textSecondary, marginTop:2 }}>{fmtDate(new Date())}</Text>
          </View>
        </View>
        <TouchableOpacity style={{ width:44, height:44, borderRadius:22, backgroundColor:colors.white, alignItems:'center', justifyContent:'center', elevation:2 }} onPress={() => navigation.navigate('Indstillinger')}><Ionicons name="settings-outline" size={24} color={colors.text} /></TouchableOpacity>
      </View>

      {/* Check-in hero */}
      <TouchableOpacity style={{ backgroundColor:colors.primary, borderRadius:28, padding:sp.lg+4, marginBottom:sp.lg, overflow:'hidden', minHeight:160, justifyContent:'center' }} onPress={() => goTab('Check-in')} activeOpacity={0.8}>
        <View style={{ position:'absolute', top:-40, right:-40, width:160, height:160, borderRadius:80, backgroundColor:'#FFFFFF12' }} />
        <View style={{ zIndex:1 }}>
          <View style={{ width:56, height:56, borderRadius:16, backgroundColor:'#FFFFFF20', alignItems:'center', justifyContent:'center', marginBottom:16 }}>
            <Ionicons name="heart" size={36} color={colors.white} />
          </View>
          <Text style={{ fontSize:28, fontWeight:'700', color:colors.white, marginBottom:6 }}>Hvordan har du det?</Text>
          <Text style={{ fontSize:18, color:colors.white, opacity:0.85 }}>Tryk her for din daglige check-in</Text>
        </View>
        <View style={{ position:'absolute', bottom:sp.lg, right:sp.lg, width:40, height:40, borderRadius:20, backgroundColor:'#FFFFFF25', alignItems:'center', justifyContent:'center' }}>
          <Ionicons name="arrow-forward" size={22} color={colors.white} />
        </View>
      </TouchableOpacity>

      {/* Næste medicin */}
      {nextMed && (
        <TouchableOpacity style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', backgroundColor:colors.white, borderRadius:20, padding:sp.md+2, marginBottom:sp.lg, elevation:2 }} onPress={() => goTab('Medicin')} activeOpacity={0.7}>
          <View style={{ flexDirection:'row', alignItems:'center' }}>
            <View style={{ width:10, height:10, borderRadius:5, backgroundColor:colors.primary, marginRight:14 }} />
            <View><Text style={{ fontSize:15, color:colors.textSecondary, fontWeight:'500' }}>Næste medicin</Text><Text style={{ fontSize:22, fontWeight:'700', color:colors.text, marginTop:2 }}>{nextMed.name}</Text></View>
          </View>
          <View style={{ flexDirection:'row', alignItems:'center', backgroundColor:colors.primaryLight, borderRadius:12, paddingHorizontal:14, paddingVertical:8 }}>
            <Ionicons name="time-outline" size={18} color={colors.primary} style={{ marginRight:4 }} />
            <Text style={{ fontSize:18, fontWeight:'600', color:colors.primary }}>{nextMed.time}</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Genveje */}
      <Text style={{ fontSize:22, fontWeight:'700', color:colors.text, marginBottom:sp.md, marginTop:sp.sm }}>Genveje</Text>
      <View style={{ flexDirection:'row', flexWrap:'wrap', justifyContent:'space-between', marginBottom:sp.xl }}>
        {QUICK.map(a => (
          <TouchableOpacity key={a.id} style={{ width:'48%', backgroundColor:colors.white, borderRadius:20, paddingVertical:sp.lg, paddingHorizontal:sp.md, alignItems:'center', marginBottom:sp.sm, elevation:2 }} onPress={() => a.route ? (a.isTab ? goTab(a.route) : navigation.navigate(a.route)) : null} activeOpacity={0.7}>
            <View style={{ width:56, height:56, borderRadius:16, backgroundColor:colors.primaryLight, alignItems:'center', justifyContent:'center', marginBottom:12 }}>
              <Ionicons name={a.icon} size={28} color={colors.primary} />
            </View>
            <Text style={{ fontSize:18, fontWeight:'600', color:colors.text, textAlign:'center' }}>{a.label}</Text>
            {!a.route && <Text style={{ fontSize:13, fontWeight:'500', color:colors.textSecondary, marginTop:6 }}>Kommer snart</Text>}
          </TouchableOpacity>
        ))}
      </View>
    </ScreenWrapper>
  );
}

// ============================================================================
// CHECK-IN SCREEN
// ============================================================================

function MoodButton({ mood, selected, onPress }) {
  const isSel = selected === mood.key;
  return (
    <TouchableOpacity style={{ flex:1, alignItems:'center', justifyContent:'center', paddingVertical:sp.lg, borderRadius:br.xl, borderWidth: isSel?3:2, borderColor:mood.color, backgroundColor: isSel?mood.lightColor:colors.white, minHeight:120 }} onPress={() => onPress(mood.key)} activeOpacity={0.7}>
      <Text style={{ fontSize:44, marginBottom:sp.sm }}>{mood.emoji}</Text>
      <Text style={[typ.h3, { textAlign:'center' }, isSel && { color:mood.color, fontWeight:'700' }]}>{mood.label}</Text>
    </TouchableOpacity>
  );
}

function CheckInScreen() {
  const [todayEntry, setTodayEntry] = useState(null);
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState('');
  const [recent, setRecent] = useState([]);
  const [saved, setSaved] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const load = useCallback(async () => {
    await seedMockData(); const t = await getTodayCheckIn(); const r = await getRecentCheckIns(7);
    setTodayEntry(t); setRecent(r);
    if (t) { setSelectedMood(t.mood); setNote(t.note||''); setSaved(true); } else { setSelectedMood(null); setNote(''); setSaved(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleSave = async () => {
    if (!selectedMood) return;
    await saveCheckIn(selectedMood, note); setSaved(true);
    Animated.sequence([Animated.timing(fadeAnim, { toValue:1, duration:300, useNativeDriver:true }), Animated.delay(1500), Animated.timing(fadeAnim, { toValue:0, duration:400, useNativeDriver:true })]).start();
    await load();
  };

  return (
    <ScreenWrapper title="Daglig check-in">
      <View style={{ alignItems:'center', paddingVertical:sp.lg, marginBottom:sp.md }}>
        <Ionicons name="sunny" size={40} color={colors.warning} />
        <Text style={[typ.h2, { marginTop:sp.md, textAlign:'center' }]}>Hvordan har du det i dag?</Text>
      </View>
      <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:sp.lg, gap:sp.sm }}>
        {Object.values(MOODS).map(m => <MoodButton key={m.key} mood={m} selected={selectedMood} onPress={k => { if(!saved) setSelectedMood(k); }} />)}
      </View>
      {selectedMood && !saved && (
        <View style={{ marginBottom:sp.lg }}>
          <Text style={[typ.body, { marginBottom:sp.sm }]}>Vil du tilføje en note? (valgfrit)</Text>
          <TextInput style={{ backgroundColor:colors.white, borderRadius:br.lg, padding:sp.md, fontSize:22, color:colors.text, borderWidth:1, borderColor:colors.border, minHeight:100, textAlignVertical:'top' }} value={note} onChangeText={setNote} placeholder="F.eks. Gik en dejlig tur..." placeholderTextColor={colors.textSecondary} multiline maxLength={200} />
        </View>
      )}
      {selectedMood && !saved && <BigButton title="Gem min check-in" icon="checkmark-circle-outline" onPress={handleSave} style={{ marginBottom:sp.lg }} />}
      {saved && (
        <View style={{ alignItems:'center', marginBottom:sp.lg }}>
          <Animated.View style={{ flexDirection:'row', alignItems:'center', marginBottom:sp.md, opacity:fadeAnim }}>
            <Ionicons name="checkmark-circle" size={28} color={colors.primary} /><Text style={[typ.body, { marginLeft:sp.xs, color:colors.primary, fontWeight:'600' }]}>Gemt!</Text>
          </Animated.View>
          <View style={{ alignItems:'center', backgroundColor:colors.white, borderRadius:br.xl, padding:sp.xl, width:'100%' }}>
            <Text style={{ fontSize:56, marginBottom:sp.sm }}>{MOODS[selectedMood]?.emoji}</Text>
            <Text style={[typ.h3, { textAlign:'center' }]}>Du sagde: {MOODS[selectedMood]?.label}</Text>
            {note ? <Text style={[typ.bodySmall, { marginTop:sp.sm, textAlign:'center', fontStyle:'italic' }]}>"{note}"</Text> : null}
          </View>
          <TouchableOpacity style={{ flexDirection:'row', alignItems:'center', marginTop:sp.md, paddingVertical:sp.sm, paddingHorizontal:sp.md }} onPress={() => setSaved(false)} activeOpacity={0.7}>
            <Ionicons name="create-outline" size={22} color={colors.primary} /><Text style={[typ.bodySmall, { marginLeft:sp.xs, color:colors.primary }]}>Ret mit svar</Text>
          </TouchableOpacity>
        </View>
      )}
      {recent.length > 0 && (
        <View style={{ marginTop:sp.md }}>
          <Text style={[typ.h2, { marginBottom:sp.lg }]}>Seneste dage</Text>
          <View style={{ flexDirection:'row', justifyContent:'space-around', backgroundColor:colors.white, borderRadius:br.lg, padding:sp.md, marginBottom:sp.lg }}>
            {recent.map(e => { const m=MOODS[e.mood]; const dn=['Søn','Man','Tir','Ons','Tor','Fre','Lør']; const d=new Date(e.date+'T00:00:00'); return (
              <View key={e.id} style={{ alignItems:'center' }}>
                <View style={{ width:40, height:40, borderRadius:br.full, alignItems:'center', justifyContent:'center', backgroundColor:m.color, marginBottom:sp.xs }}><Text style={{ fontSize:20 }}>{m.emoji}</Text></View>
                <Text style={{ fontSize:14, fontWeight:'600', color:colors.textSecondary }}>{dn[d.getDay()]}</Text>
                <Text style={{ fontSize:13, color:colors.textSecondary }}>{d.getDate()}.</Text>
              </View>
            ); })}
          </View>
        </View>
      )}
    </ScreenWrapper>
  );
}

// ============================================================================
// CHAT SCREEN
// ============================================================================

function ChatScreen() {
  const [messages, setMessages] = useState([{ ...WELCOME_MSG, timestamp: new Date().toISOString() }]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSug, setShowSug] = useState(true);
  const listRef = useRef(null);
  const scroll = useCallback(() => { setTimeout(() => listRef.current?.scrollToEnd({ animated:true }), 100); }, []);

  const handleSend = useCallback(async (text) => {
    const t = (text||inputText).trim(); if(!t||isTyping) return;
    setMessages(p => [...p, createMsg(t,'user')]); setInputText(''); setShowSug(false); setIsTyping(true); scroll();
    try { const reply = await sendChatMessage(t); setMessages(p => [...p, createMsg(reply,'ai')]); } catch { setMessages(p => [...p, createMsg('Beklager, der opstod en fejl.','ai')]); }
    finally { setIsTyping(false); scroll(); }
  }, [inputText, isTyping, scroll]);

  const renderMsg = useCallback(({ item }) => {
    const isUser = item.sender==='user';
    return (
      <View style={{ maxWidth:'85%', padding:sp.md, borderRadius:br.lg, marginBottom:sp.sm, backgroundColor: isUser?colors.chatBubbleUser:colors.chatBubbleAI, alignSelf: isUser?'flex-end':'flex-start', borderBottomRightRadius: isUser?br.sm:br.lg, borderBottomLeftRadius: isUser?br.lg:br.sm }}>
        {!isUser && <View style={{ flexDirection:'row', alignItems:'center', marginBottom:sp.xs }}><Ionicons name="sparkles" size={18} color={colors.primary} /><Text style={{ fontSize:16, fontWeight:'600', color:colors.primary, marginLeft:6 }}>CareMate</Text></View>}
        <Text style={[typ.body, { color: isUser?colors.white:colors.text }]}>{item.text}</Text>
      </View>
    );
  }, []);

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:colors.background }} edges={['top']}>
      <View style={{ flexDirection:'row', alignItems:'center', paddingHorizontal:sp.lg, paddingVertical:sp.md, backgroundColor:colors.white, borderBottomWidth:1, borderBottomColor:colors.border }}>
        <View style={{ width:48, height:48, borderRadius:br.full, backgroundColor:colors.primary, alignItems:'center', justifyContent:'center', marginRight:sp.md }}><Ionicons name="chatbubble-ellipses" size={28} color={colors.white} /></View>
        <View><Text style={[typ.h3, { marginBottom:0 }]}>AI-assistent</Text><Text style={{ fontSize:16, color:colors.textSecondary }}>Din digitale hjælper</Text></View>
      </View>
      <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS==='ios'?'padding':undefined} keyboardVerticalOffset={90}>
        <FlatList ref={listRef} data={messages} renderItem={renderMsg} keyExtractor={i=>i.id} contentContainerStyle={{ padding:sp.lg, paddingBottom:sp.md }} onContentSizeChange={scroll} showsVerticalScrollIndicator={false} ListFooterComponent={isTyping ? <View style={{ maxWidth:'85%', padding:sp.md, borderRadius:br.lg, backgroundColor:colors.chatBubbleAI, alignSelf:'flex-start', opacity:0.8 }}><View style={{ flexDirection:'row', alignItems:'center', marginBottom:sp.xs }}><Ionicons name="sparkles" size={18} color={colors.primary} /><Text style={{ fontSize:16, fontWeight:'600', color:colors.primary, marginLeft:6 }}>CareMate</Text></View><Text style={[typ.body, { color:colors.textSecondary, fontStyle:'italic' }]}>Skriver ...</Text></View> : null} />
        <SuggestionChips suggestions={SUGGESTIONS} onSelect={s => handleSend(s.text)} visible={showSug && messages.length <= 1} />
        <View style={{ flexDirection:'row', alignItems:'flex-end', paddingHorizontal:sp.sm, paddingVertical:sp.sm, backgroundColor:colors.white, borderTopWidth:1, borderTopColor:colors.border }}>
          <TouchableOpacity style={{ width:52, height:52, borderRadius:br.full, backgroundColor:colors.primaryLight, alignItems:'center', justifyContent:'center', marginRight:sp.xs }} onPress={() => Alert.alert('Stemmestyring','Kommer snart!\n\nIndtil da kan du skrive eller vælge et forslag.',[{text:'Forstået'}])}><Ionicons name="mic-outline" size={28} color={colors.primary} /></TouchableOpacity>
          <TextInput style={{ flex:1, backgroundColor:colors.background, borderRadius:br.xl, paddingHorizontal:sp.md, paddingVertical:sp.sm, fontSize:22, maxHeight:140, color:colors.text }} value={inputText} onChangeText={setInputText} placeholder="Skriv en besked..." placeholderTextColor={colors.textSecondary} multiline maxLength={500} returnKeyType="send" onSubmitEditing={() => handleSend()} editable={!isTyping} />
          <TouchableOpacity style={{ width:52, height:52, borderRadius:br.full, backgroundColor: inputText.trim()&&!isTyping ? colors.primary : colors.border, alignItems:'center', justifyContent:'center', marginLeft:sp.xs }} onPress={() => handleSend()} disabled={!inputText.trim()||isTyping}><Ionicons name="send" size={24} color={inputText.trim()&&!isTyping ? colors.white : colors.textSecondary} /></TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ============================================================================
// MEDICINE SCREEN
// ============================================================================

function MedicineScreen() {
  const [meds, setMeds] = useState([]);
  const [log, setLog] = useState([]);
  const [modal, setModal] = useState(false);
  const [nn, setNn] = useState(''); const [nt, setNt] = useState(''); const [nd, setNd] = useState('');

  const load = useCallback(async () => { await seedMedicineData(); setMeds(await getAllMedicines()); setLog(await getTodayLog()); }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const taken = log.length, total = meds.length, allDone = total>0 && taken>=total;
  return (
    <ScreenWrapper title="Medicin">
      <View style={{ flexDirection:'row', alignItems:'center', backgroundColor: allDone?colors.primaryLight:colors.white, borderRadius:br.xl, padding:sp.lg, marginBottom:sp.xl, borderLeftWidth:5, borderLeftColor: allDone?colors.primary:colors.secondary, elevation:1 }}>
        <Ionicons name={allDone?'checkmark-done-circle':'medkit'} size={40} color={allDone?colors.primary:colors.secondary} />
        <View style={{ flex:1, marginLeft:sp.md }}>
          <Text style={[typ.h3, { marginBottom:sp.xs }]}>{allDone?'Alle taget i dag!':'Dagens medicin'}</Text>
          <Text style={[typ.body, { color:colors.textSecondary }]}>{taken} af {total} registreret</Text>
        </View>
      </View>
      {meds.map(m => <MedicineCard key={m.id} name={m.name} time={m.time} dosage={m.dosage} status={getMedicineStatus(m,log)} onTake={async()=>{await markMedicineTaken(m.id);await load();}} onUndo={async()=>{await unmarkMedicineTaken(m.id);await load();}} onLongPress={()=>Alert.alert('Fjern medicin',`Fjern "${m.name}"?`,[{text:'Annullér',style:'cancel'},{text:'Fjern',style:'destructive',onPress:async()=>{await removeMedicine(m.id);await load();}}])} />)}
      <BigButton title="Tilføj medicin" icon="add-circle-outline" variant="secondary" onPress={() => setModal(true)} />
      <Text style={[typ.caption, { textAlign:'center', marginTop:sp.sm, marginBottom:sp.lg }]}>Hold inde på et kort for at fjerne medicin.</Text>
      <Modal visible={modal} animationType="slide" transparent onRequestClose={() => setModal(false)}>
        <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'flex-end' }}>
          <View style={{ backgroundColor:colors.white, borderTopLeftRadius:br.xl, borderTopRightRadius:br.xl, padding:sp.xl, paddingBottom:sp.xxl }}>
            <Text style={typ.h2}>Tilføj ny medicin</Text>
            <Text style={[typ.body, { marginTop:sp.lg, marginBottom:sp.xs }]}>Navn *</Text>
            <TextInput style={{ backgroundColor:colors.background, borderRadius:br.md, padding:sp.md, fontSize:22, color:colors.text, borderWidth:1, borderColor:colors.border }} value={nn} onChangeText={setNn} placeholder="F.eks. Hjertemedicin" placeholderTextColor={colors.textSecondary} />
            <Text style={[typ.body, { marginTop:sp.lg, marginBottom:sp.xs }]}>Tidspunkt *</Text>
            <TextInput style={{ backgroundColor:colors.background, borderRadius:br.md, padding:sp.md, fontSize:22, color:colors.text, borderWidth:1, borderColor:colors.border }} value={nt} onChangeText={setNt} placeholder="F.eks. 08:00" placeholderTextColor={colors.textSecondary} keyboardType="numbers-and-punctuation" />
            <Text style={[typ.body, { marginTop:sp.lg, marginBottom:sp.xs }]}>Dosering (valgfrit)</Text>
            <TextInput style={{ backgroundColor:colors.background, borderRadius:br.md, padding:sp.md, fontSize:22, color:colors.text, borderWidth:1, borderColor:colors.border }} value={nd} onChangeText={setNd} placeholder="F.eks. 1 tablet" placeholderTextColor={colors.textSecondary} />
            <View style={{ flexDirection:'row', marginTop:sp.xl, gap:sp.sm }}>
              <BigButton title="Annullér" variant="secondary" onPress={() => { setNn('');setNt('');setNd('');setModal(false); }} style={{ flex:1 }} />
              <BigButton title="Tilføj" onPress={async () => { if(!nn.trim()||!nt.trim()){Alert.alert('Mangler','Udfyld navn og tidspunkt');return;} await addMedicine(nn,nt,nd||null); setNn('');setNt('');setNd('');setModal(false); await load(); }} style={{ flex:1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

// ============================================================================
// SOS SCREEN
// ============================================================================

const CONTACTS = [
  { id:'1', name:'Anna Jensen', relation:'Datter', phone:'+4512345678', type:'family' },
  { id:'2', name:'Erik Jensen', relation:'Søn', phone:'+4587654321', type:'family' },
  { id:'3', name:'Dr. Møller', relation:'Egen læge', phone:'+4555667788', type:'medical' },
];
const NUMS = [
  { id:'sos', number:'112', label:'Akut nødsituation', icon:'call', iconColor:colors.danger },
  { id:'doc', number:'1813', label:'Lægevagten (ikke akut)', icon:'medkit', iconColor:colors.secondary },
  { id:'poi', number:'70 201 201', label:'Giftlinjen', icon:'information-circle', iconColor:colors.primary },
];

function openPhone(p,n) { Linking.canOpenURL(`tel:${p}`).then(ok => ok ? Linking.openURL(`tel:${p}`) : Alert.alert('Kan ikke ringe',`Kunne ikke ringe til ${n}`)); }
function openSMS(p,n) { Linking.canOpenURL(`sms:${p}`).then(ok => ok ? Linking.openURL(`sms:${p}`) : Alert.alert('Kan ikke sende besked',`Kunne ikke sende til ${n}`)); }

function SOSScreen() {
  return (
    <ScreenWrapper title="Kontakter og hjælp">
      <View style={{ alignItems:'center', marginBottom:sp.lg }}>
        <BigButton title="Få hjælp nu" icon="hand-left-outline" variant="danger" onPress={() => Alert.alert('Få hjælp nu','Hvem vil du kontakte?',[{text:'Ring 112',style:'destructive',onPress:()=>openPhone('112','Alarmcentralen')},{text:'Ring pårørende',onPress:()=>{const f=CONTACTS.find(c=>c.type==='family');if(f) openPhone(f.phone,f.name);}},{text:'Annullér',style:'cancel'}])} style={{ width:'100%', minHeight:88, borderRadius:br.xl }} />
        <Text style={[typ.caption, { marginTop:sp.sm, textAlign:'center' }]}>Ring 112 eller kontakt en pårørende</Text>
      </View>
      <Text style={[typ.h2, { marginTop:sp.lg, marginBottom:sp.md }]}>Dine kontakter</Text>
      {CONTACTS.map(c => <ContactCard key={c.id} contact={c} onCall={x=>openPhone(x.phone,x.name)} onMessage={x=>openSMS(x.phone,x.name)} />)}
      <Text style={[typ.h2, { marginTop:sp.lg, marginBottom:sp.md }]}>Nyttige numre</Text>
      <View style={{ backgroundColor:colors.white, borderRadius:br.lg, padding:sp.md, marginBottom:sp.xl, elevation:1 }}>
        {NUMS.map((e,i) => (
          <React.Fragment key={e.id}>
            {i>0 && <View style={{ height:1, backgroundColor:colors.border }} />}
            <TouchableOpacity style={{ flexDirection:'row', alignItems:'center', paddingVertical:sp.md, paddingHorizontal:sp.sm, minHeight:64 }} onPress={() => openPhone(e.number.replace(/\s/g,''),e.label)} activeOpacity={0.7}>
              <Ionicons name={e.icon} size={30} color={e.iconColor} />
              <View style={{ flex:1, marginLeft:sp.md }}><Text style={typ.h3}>{e.number}</Text><Text style={typ.bodySmall}>{e.label}</Text></View>
              <Ionicons name="call-outline" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </React.Fragment>
        ))}
      </View>
    </ScreenWrapper>
  );
}

// ============================================================================
// SETTINGS SCREEN
// ============================================================================

function SettingsScreen({ navigation }) {
  const [s, setS] = useState({ ...DEFAULT_SETTINGS });
  const tog = k => setS(p => ({ ...p, [k]: !p[k] }));
  const Row = ({ icon, label, value, desc, onPress, arrow, dim }) => (
    <TouchableOpacity style={{ flexDirection:'row', alignItems:'center', paddingVertical:sp.md, paddingHorizontal:sp.md, minHeight:64 }} onPress={onPress} activeOpacity={0.6}>
      <Ionicons name={icon} size={26} color={dim?colors.textSecondary:colors.primary} style={{ marginRight:sp.md, width:30, textAlign:'center' }} />
      <View style={{ flex:1 }}><Text style={[typ.body, dim&&{color:colors.textSecondary}]}>{label}</Text>{desc?<Text style={typ.caption} numberOfLines={2}>{desc}</Text>:null}</View>
      {value?<Text style={[typ.bodySmall, { marginLeft:sp.sm, color:colors.textSecondary }]}>{value}</Text>:null}
      {arrow && <Ionicons name="chevron-forward" size={22} color={colors.textSecondary} />}
    </TouchableOpacity>
  );
  const Tog = ({ icon, label, desc, value, onToggle }) => (
    <View style={{ flexDirection:'row', alignItems:'center', paddingVertical:sp.md, paddingHorizontal:sp.md, minHeight:64 }}>
      <Ionicons name={icon} size={26} color={colors.primary} style={{ marginRight:sp.md, width:30, textAlign:'center' }} />
      <View style={{ flex:1 }}><Text style={typ.body}>{label}</Text>{desc?<Text style={typ.caption}>{desc}</Text>:null}</View>
      <Switch value={value} onValueChange={onToggle} trackColor={{false:colors.border,true:colors.primaryLight}} thumbColor={value?colors.primary:colors.textSecondary} />
    </View>
  );
  const Div = () => <View style={{ height:1, backgroundColor:colors.border, marginLeft:sp.md+30+sp.md }} />;
  const Card = ({ children }) => <View style={{ backgroundColor:colors.white, borderRadius:br.lg, overflow:'hidden', elevation:1 }}>{children}</View>;
  const Sec = ({ icon, title }) => <View style={{ flexDirection:'row', alignItems:'center', marginTop:sp.lg, marginBottom:sp.sm }}><Ionicons name={icon} size={24} color={colors.primary} /><Text style={[typ.h3, { marginLeft:sp.sm, marginBottom:0 }]}>{title}</Text></View>;
  const placeholder = () => Alert.alert('Profil','Redigering kommer snart.');
  return (
    <ScreenWrapper title="Indstillinger">
      {navigation && <TouchableOpacity style={{ flexDirection:'row', alignItems:'center', marginBottom:sp.md }} onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={26} color={colors.primary} /><Text style={{ fontSize:20, fontWeight:'500', color:colors.primary, marginLeft:sp.xs }}>Tilbage</Text></TouchableOpacity>}
      <Sec icon="person-circle-outline" title="Profil" />
      <Card><Row icon="person-outline" label="Navn" value="Ikke angivet" onPress={placeholder} /><Div /><Row icon="calendar-outline" label="Fødselsdato" value="Ikke angivet" onPress={placeholder} /><Div /><Row icon="call-outline" label="Telefon" value="Ikke angivet" onPress={placeholder} /></Card>
      <Sec icon="alert-circle-outline" title="Nødkontakter" />
      <Card><Row icon="people-outline" label="Administrér kontakter" desc="Tilføj eller redigér dine betroede kontakter" onPress={() => Alert.alert('Nødkontakter','Fuld redigering kommer snart.')} arrow /><Div /><Row icon="chatbubble-outline" label="Nødbesked" desc={s.emergencyMessage} onPress={() => Alert.alert('Nødbesked','Redigering kommer snart.')} arrow /></Card>
      <Sec icon="medkit-outline" title="Medicinindstillinger" />
      <Card><Tog icon="notifications-outline" label="Medicinpåmindelser" desc="Få besked når det er tid til medicin" value={s.medicineReminders} onToggle={() => tog('medicineReminders')} /></Card>
      <Sec icon="alarm-outline" title="Påmindelser" />
      <Card><Tog icon="heart-circle-outline" label="Daglig check-in" desc="Påmindelse om at fortælle hvordan du har det" value={s.checkInReminders} onToggle={() => tog('checkInReminders')} /><Div /><Row icon="time-outline" label="Tidspunkt" value={s.checkInReminderTime} onPress={() => Alert.alert('Tidspunkt','Valg af tidspunkt kommer snart.')} /></Card>
      <Sec icon="accessibility-outline" title="Tilgængelighed" />
      <Card><Tog icon="text-outline" label="Stor skrift" desc="Gør al tekst større" value={s.largeText} onToggle={() => tog('largeText')} /><Div /><Tog icon="contrast-outline" label="Høj kontrast" desc="Tydeligere farver og kanter" value={s.highContrast} onToggle={() => tog('highContrast')} /></Card>
      <Sec icon="mic-outline" title="Stemmestyring" />
      <Card><Row icon="mic-outline" label="Aktiver stemmestyring" desc="Styr CareMate med din stemme (kommer snart)" onPress={() => Alert.alert('Stemmestyring','Kommer i en fremtidig opdatering.',[{text:'Forstået'}])} arrow dim /></Card>
      <Text style={{ textAlign:'center', color:colors.textSecondary, fontSize:16, marginTop:sp.xl, marginBottom:sp.lg }}>CareMate v1.0.0</Text>
    </ScreenWrapper>
  );
}

// ============================================================================
// NAVIGATION
// ============================================================================

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const ICONS = {
  HjemTab: { f:'home', u:'home-outline' },
  'Check-in': { f:'heart-circle', u:'heart-circle-outline' },
  'AI-assistent': { f:'chatbubble-ellipses', u:'chatbubble-ellipses-outline' },
  Medicin: { f:'medkit', u:'medkit-outline' },
  'Hjælp': { f:'call', u:'call-outline' },
};

function HomeStack() {
  return <Stack.Navigator screenOptions={{ headerShown:false }}><Stack.Screen name="Hjem" component={HomeScreen} /><Stack.Screen name="Indstillinger" component={SettingsScreen} /></Stack.Navigator>;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => { const ic = ICONS[route.name]; return <Ionicons name={focused?ic.f:ic.u} size={size} color={color} />; },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: { height:90, paddingBottom:14, paddingTop:10, borderTopWidth:1, borderTopColor:colors.border, backgroundColor:colors.white },
          tabBarLabelStyle: { fontSize:16, fontWeight:'600' },
          tabBarIconStyle: { marginTop:6 },
        })}>
          <Tab.Screen name="HjemTab" component={HomeStack} options={{ tabBarLabel:'Hjem' }} />
          <Tab.Screen name="Check-in" component={CheckInScreen} />
          <Tab.Screen name="AI-assistent" component={ChatScreen} />
          <Tab.Screen name="Medicin" component={MedicineScreen} />
          <Tab.Screen name="Hjælp" component={SOSScreen} options={{ tabBarLabelStyle:{ fontSize:16, fontWeight:'700', color:colors.danger }, tabBarIconStyle:{marginTop:6} }} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
