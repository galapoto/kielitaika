import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  listPaths,
  listWorkplaceFields,
  fetchWorkplaceLesson,
  fetchVocab,
  fetchSrsQueue,
} from '../utils/api';
import { usePath } from '../context/PathContext';

export default function LessonScreen() {
  const navigation = useNavigation();
  const { setPath, setProfession } = usePath();
  const [paths, setPaths] = useState([]);
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState('sairaanhoitaja');
  const [lesson, setLesson] = useState(null);
  const [vocab, setVocab] = useState([]);
  const [srsQueue, setSrsQueue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [{ paths: apiPaths }, { fields: apiFields }] = await Promise.all([
          listPaths(),
          listWorkplaceFields(),
        ]);
        setPaths(apiPaths || []);
        setFields(apiFields || []);
      } catch (err) {
        setError(err.message || 'Failed to load metadata');
      }
    };
    bootstrap();
  }, []);

  useEffect(() => {
    const loadLesson = async () => {
      if (!selectedField) return;
      setLoading(true);
      setError('');
      try {
        const [lessonRes, vocabRes] = await Promise.all([
          fetchWorkplaceLesson(selectedField),
          fetchVocab('workplace', selectedField, 8),
        ]);
        setLesson(lessonRes);
        setVocab(vocabRes.items || []);
      } catch (err) {
        setError(err.message || 'Failed to load lesson');
      } finally {
        setLoading(false);
      }
    };
    loadLesson();
  }, [selectedField]);

  useEffect(() => {
    const loadSrs = async () => {
      try {
        const { queue } = await fetchSrsQueue([], selectedField, 8);
        setSrsQueue(queue || []);
      } catch (err) {
        // non-blocking
      }
    };
    loadSrs();
  }, [selectedField]);

  const renderPaths = () => (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ fontWeight: '600', marginBottom: 4 }}>Paths</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {paths.map((p) => (
          <View
            key={p.id}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#ccc',
              marginRight: 8,
            }}
          >
            <Text style={{ fontSize: 13 }}>{p.label}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderFields = () => (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ fontWeight: '600', marginBottom: 4 }}>Workplace tracks</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {fields.map((f) => (
          <TouchableOpacity
            key={f.id}
            onPress={() => {
              setSelectedField(f.id);
              setPath('workplace');
              setProfession(f.id);
            }}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 12,
              borderWidth: selectedField === f.id ? 0 : 1,
              borderColor: '#ccc',
              backgroundColor: selectedField === f.id ? '#e0f2ff' : '#fff',
              marginRight: 8,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: selectedField === f.id ? '700' : '500' }}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderLesson = () => {
    if (loading) return <ActivityIndicator />;
    if (!lesson) return null;
    return (
      <View style={{ padding: 12, borderRadius: 12, backgroundColor: '#f6f7fb', marginBottom: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 6 }}>{lesson.title}</Text>
        <Text style={{ marginBottom: 6 }}>{lesson.prompt}</Text>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('Roleplay', {
              field: selectedField,
              title: lesson.title,
              prompt: lesson.prompt,
            })
          }
          style={{
            alignSelf: 'flex-start',
            marginTop: 6,
            paddingHorizontal: 12,
            paddingVertical: 8,
            backgroundColor: '#0A3D62',
            borderRadius: 10,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>Start roleplay</Text>
        </TouchableOpacity>
        <Text style={{ fontWeight: '600', marginTop: 6 }}>Grammar tip</Text>
        <Text style={{ marginBottom: 6 }}>{lesson.grammar_tip}</Text>
        <Text style={{ fontWeight: '600', marginTop: 6 }}>Writing task</Text>
        <Text>{lesson.writing_task}</Text>
      </View>
    );
  };

  const renderVocab = () => {
    if (!vocab.length) return null;
    return (
      <View>
        <Text style={{ fontWeight: '600', marginBottom: 4 }}>Key vocabulary</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {vocab.map((item) => (
            <View
              key={item.fi}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 10,
                backgroundColor: '#eef2f7',
                marginRight: 8,
                marginBottom: 8,
              }}
            >
              <Text style={{ fontWeight: '600' }}>{item.fi}</Text>
              <Text style={{ fontSize: 12, color: '#444' }}>{item.en}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderSrs = () => {
    if (!srsQueue.length) return null;
    return (
      <View style={{ marginTop: 12 }}>
        <Text style={{ fontWeight: '600', marginBottom: 4 }}>Review queue</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {srsQueue.map((term) => (
            <View
              key={term}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 10,
                backgroundColor: '#fff3cd',
                borderWidth: 1,
                borderColor: '#facc15',
                marginRight: 8,
                marginBottom: 8,
              }}
            >
              <Text style={{ fontWeight: '600', color: '#92400e' }}>{term}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 24 }}>
      <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 10 }}>Lessons</Text>
      {error ? <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text> : null}
      {renderPaths()}
      {renderFields()}
      {renderLesson()}
      {renderVocab()}
      {renderSrs()}
    </ScrollView>
  );
}
