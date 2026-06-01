// Variables globales
let mediaRecorder;
let audioChunks = [];
let currentStream = null;
let microphoneSelectElement = null;
let isRecording = false;
let isPaused = false;
let audioContext = null;
let analyser = null;
let microphoneSource = null;
let waveformCanvas = null;
let waveformCtx = null;

// Éléments DOM
document.addEventListener('DOMContentLoaded', () => {
  // Récupération des éléments
  const authSection = document.getElementById('auth-section');
  const recorderSection = document.getElementById('recorder-section');
  const tokenInput = document.getElementById('token-input');
  const saveTokenBtn = document.getElementById('save-token-btn');
  const authStatus = document.getElementById('auth-status');
  const startBtn = document.getElementById('start-btn');
  const stopBtn = document.getElementById('stop-btn');
  const pauseBtn = document.getElementById('pause-btn');
  const recordingStatus = document.getElementById('recording-status');
  const languageSelect = document.getElementById('language-select');
  const playback = document.getElementById('playback');
  const recordingWarning = document.getElementById('recording-warning');
  const backBtn = document.getElementById('back-btn');
  const backBtnRecorder = document.getElementById('back-btn-recorder');
  
  // Éléments pour la visualisation audio
  waveformCanvas = document.getElementById('waveform-canvas');
  waveformCtx = waveformCanvas.getContext('2d');
  const waveformContainer = document.getElementById('waveform-container');

  // Créer le sélecteur de microphone dynamiquement
  microphoneSelectElement = document.createElement('select');
  microphoneSelectElement.id = 'microphone-select-dynamic';
  microphoneSelectElement.style.width = '100%';
  microphoneSelectElement.style.marginBottom = '10px';

  // Insérer le sélecteur après le label Microphone
  const microphoneLabel = document.querySelector('label[for="microphone-select"]');
  if (microphoneLabel) {
    microphoneLabel.parentNode.insertBefore(microphoneSelectElement, microphoneLabel.nextSibling);
  }

  // Bouton de retour vers l'accueil
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }

  if (backBtnRecorder) {
    backBtnRecorder.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }

  // Vérifier si un token est déjà sauvegardé
  checkToken();

  // Charger les microphones disponibles
  loadMicrophones();

  // Gestion du bouton Pause
  pauseBtn.addEventListener('click', () => {
    if (isPaused) {
      // Reprendre l'enregistrement
      mediaRecorder.resume();
      pauseBtn.textContent = '⏸ Mettre en pause';
      pauseBtn.style.background = '#ffc107';
      recordingStatus.textContent = "⏺ Enregistrement en cours...";
      isPaused = false;
      resumeAudioVisualization();
    } else {
      // Mettre en pause l'enregistrement
      mediaRecorder.pause();
      pauseBtn.textContent = '▶ Reprendre';
      pauseBtn.style.background = '#28a745';
      recordingStatus.textContent = "⏸ Enregistrement en pause";
      isPaused = true;
      pauseAudioVisualization();
    }
  });

  // Gestion du token
  saveTokenBtn.addEventListener('click', () => {
    const token = tokenInput.value.trim();
    if (!token) {
      authStatus.textContent = '⚠️ Veuillez saisir un token.';
      authStatus.style.color = 'red';
      return;
    }

    // Sauvegarder le token dans localStorage
    localStorage.setItem('accessToken', token);
    authStatus.textContent = '✅ Token sauvegardé !';
    authStatus.style.color = 'green';
    
    setTimeout(() => {
      authSection.style.display = 'none';
      recorderSection.style.display = 'block';
      authStatus.textContent = '';
    }, 1000);
  });

  function checkToken() {
    const token = localStorage.getItem('accessToken');
    if (token) {
      authSection.style.display = 'none';
      recorderSection.style.display = 'block';
      loadMicrophones();
    }
  }

  async function loadMicrophones() {
    try {
      microphoneSelectElement.innerHTML = '<option value="">Chargement des microphones...</option>';
      microphoneSelectElement.style.display = 'block';
      
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      
      microphoneSelectElement.innerHTML = '';
      
      if (audioInputs.length > 0) {
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Microphone par défaut';
        microphoneSelectElement.appendChild(defaultOption);
        
        audioInputs.forEach((device, index) => {
          const option = document.createElement('option');
          option.value = device.deviceId;
          option.textContent = device.label || `Microphone ${index + 1}`;
          microphoneSelectElement.appendChild(option);
        });
        
        microphoneSelectElement.style.display = 'block';
      } else {
        microphoneSelectElement.innerHTML = '<option value="">Aucun microphone détecté</option>';
        microphoneSelectElement.style.display = 'block';
        microphoneSelectElement.disabled = true;
      }
    } catch (error) {
      console.warn('Erreur lors du chargement des microphones:', error);
      microphoneSelectElement.innerHTML = '<option value="">Erreur de détection</option>';
      microphoneSelectElement.style.display = 'block';
    }
  }

  // Démarrer l'enregistrement
  startBtn.addEventListener('click', async () => {
    try {
      recordingStatus.textContent = "🔊 Demande d'accès au microphone...";
      recordingStatus.style.color = 'blue';
      
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }

      let audioConstraints = true;
      
      if (microphoneSelectElement && microphoneSelectElement.value) {
        audioConstraints = {
          deviceId: { exact: microphoneSelectElement.value }
        };
      }

      console.log('Contraintes audio:', audioConstraints);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: audioConstraints,
        video: false
      });
      
      currentStream = stream;
      console.log('Stream obtenu avec succès:', stream);

      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];

      mediaRecorder.ondataavailable = (e) => {
        console.log('Données audio disponibles:', e.data.size, 'Type:', e.data.type);
        audioChunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        console.log('Enregistrement arrêté. Taille des chunks:', audioChunks.length);
        if (audioChunks.length > 0) {
          const mimeType = audioChunks[0].type || 'audio/webm';
          const audioBlob = new Blob(audioChunks, { type: mimeType });
          const audioUrl = URL.createObjectURL(audioBlob);
          playback.src = audioUrl;
          playback.style.display = 'block';
          
          const uploadBtn = document.getElementById('upload-btn');
          if (!uploadBtn) {
            createUploadButton(audioBlob);
          }
        }
        
        if (currentStream) {
          currentStream.getTracks().forEach(track => track.stop());
        }
        
        // Arrêter la visualisation audio
        stopAudioVisualization();
        waveformContainer.style.display = 'none';
        
        isRecording = false;
        isPaused = false;
        pauseBtn.disabled = true;
        pauseBtn.textContent = '⏸ Mettre en pause';
        pauseBtn.style.background = '#ffc107';
        allowPopupClose();
        recordingWarning.style.display = 'none';
      };

      mediaRecorder.onerror = (e) => {
        console.error('Erreur MediaRecorder:', e);
        recordingStatus.textContent = "❌ Erreur MediaRecorder: " + e.message;
        recordingStatus.style.color = 'red';
        startBtn.disabled = false;
        stopBtn.disabled = true;
        isRecording = false;
        allowPopupClose();
        recordingWarning.style.display = 'none';
      };

      // Empêcher la fermeture pendant l'enregistrement
      preventPopupClose();
      isRecording = true;
      isPaused = false;
      recordingWarning.style.display = 'block';
      
      // Initialiser la visualisation audio
      initAudioVisualization(stream);
      waveformContainer.style.display = 'block';
      
      mediaRecorder.start();
      startBtn.disabled = true;
      stopBtn.disabled = false;
      pauseBtn.disabled = false;
      recordingStatus.textContent = "⏺ Enregistrement en cours...";
      recordingStatus.style.color = 'red';
      
      // Démarrer le dessin de la waveform
      drawWaveform();

    } catch (error) {
      console.error("Erreur complète getUserMedia:", error);
      console.error("Nom:", error.name);
      console.error("Message:", error.message);
      console.error("Stack:", error.stack);
      
      isRecording = false;
      allowPopupClose();
      recordingWarning.style.display = 'none';
      
      let errorMessage = "⚠️ Erreur inconnue";
      if (error.name === 'NotAllowedError') {
        errorMessage = "⚠️ Accès au micro refusé. Veuillez autoriser l'accès au microphone.";
      } else if (error.name === 'NotFoundError') {
        errorMessage = "⚠️ Aucun micro détecté. Vérifiez votre matériel.";
      } else if (error.name === 'NotReadableError') {
        errorMessage = "⚠️ Le micro est utilisé par une autre application.";
      } else if (error.name === 'AbortError') {
        errorMessage = "⚠️ L'opération a été annulée.";
      } else if (error.message) {
        errorMessage = "⚠️ Erreur: " + error.message;
      }
      
      recordingStatus.textContent = errorMessage;
      recordingStatus.style.color = 'red';
      startBtn.disabled = false;
      stopBtn.disabled = true;
    }
  });

  stopBtn.addEventListener('click', () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      startBtn.disabled = false;
      stopBtn.disabled = true;
      pauseBtn.disabled = true;
      pauseBtn.textContent = '⏸ Mettre en pause';
      pauseBtn.style.background = '#ffc107';
      recordingStatus.textContent = "✅ Enregistrement terminé. Prêt à envoyer.";
      recordingStatus.style.color = 'green';
    }
  });

  function createUploadButton(audioBlob) {
    const oldUploadBtn = document.getElementById('upload-btn');
    if (oldUploadBtn) {
      oldUploadBtn.remove();
    }

    const uploadBtn = document.createElement('button');
    uploadBtn.id = 'upload-btn';
    uploadBtn.textContent = '📤 Envoyer vers Authôt APP';
    uploadBtn.style.marginTop = '15px';
    uploadBtn.style.background = '#28a745';
    
    uploadBtn.addEventListener('click', () => {
      uploadToAuthot(audioBlob);
    });

    stopBtn.parentNode.insertBefore(uploadBtn, stopBtn.nextSibling);
  }

  async function uploadToAuthot(audioBlob) {
    const uploadBtn = document.getElementById('upload-btn');
    const selectedLanguage = languageSelect.value;
    
    uploadBtn.disabled = true;
    uploadBtn.textContent = '⏳ Envoi en cours...';
    recordingStatus.textContent = "⏳ Envoi vers Authôt APP...";
    recordingStatus.style.color = 'blue';

    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        throw new Error('Token non trouvé. Veuillez vous reconnecter.');
      }

      // Mapper les codes de langue courts vers les codes API
      const langMap = {
        'fr': 'fr-FR',
        'en': 'en-GB',
        'es': 'es-ES'
      };
      
      const apiLang = langMap[selectedLanguage] || selectedLanguage;
      
      const formData = new FormData();
      const audioType = audioBlob.type || 'audio/webm';
      const fileExtension = audioType.includes('wav') ? 'wav' : 
                          audioType.includes('webm') ? 'webm' : 
                          audioType.includes('ogg') ? 'ogg' : 'audio';
      formData.append('data', audioBlob, `recording.${fileExtension}`);
      formData.append('lang', apiLang);
      
      console.log('Envoi vers: https://authot.app/api/sounds/new');
      console.log('Langue API:', apiLang);
      console.log('Fichier:', `recording.${fileExtension}`, 'Type:', audioBlob.type);
      
      const response = await fetch('https://authot.app/api/sounds/new', {
        method: 'POST',
        headers: {
          'Access-Token': token,
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorText = await response.text().catch(() => '');
        console.error(`Réponse de l'API:`, {
          status: response.status,
          statusText: response.statusText,
          errorData: errorData,
          errorText: errorText
        });
        
        let errorMessage = `Erreur ${response.status}`;
        if (errorData.message) {
          errorMessage += `: ${errorData.message}`;
        } else if (errorText) {
          errorMessage += `: ${errorText.substring(0, 100)}`;
        } else if (response.statusText) {
          errorMessage += `: ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      
      recordingStatus.textContent = "✅ Fichier envoyé avec succès !";
      recordingStatus.style.color = 'green';
      uploadBtn.textContent = '📤 Envoyer vers Authôt APP';
      uploadBtn.disabled = false;
      
      setTimeout(() => {
        audioChunks = [];
        playback.style.display = 'none';
        playback.src = '';
      }, 2000);

    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      recordingStatus.textContent = `❌ Erreur: ${error.message}`;
      recordingStatus.style.color = 'red';
      uploadBtn.textContent = '📤 Réessayer';
      uploadBtn.disabled = false;
    }
  }

  // Fonctions pour la visualisation audio
  function initAudioVisualization(stream) {
    try {
      // Créer le contexte audio
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      
      // Créer la source à partir du stream
      microphoneSource = audioContext.createMediaStreamSource(stream);
      microphoneSource.connect(analyser);
      
      // Créer un tableau pour les données de fréquence
      analyser.smoothingTimeConstant = 0.8;
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la visualisation audio:', error);
    }
  }

  function drawWaveform() {
    if (!analyser || !waveformCtx) return;
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    function draw() {
      if (!isRecording || isPaused) return;
      
      // S'assurer que le canvas a la bonne taille
      if (waveformCanvas.width !== waveformCanvas.offsetWidth || 
          waveformCanvas.height !== waveformCanvas.offsetHeight) {
        waveformCanvas.width = waveformCanvas.offsetWidth;
        waveformCanvas.height = waveformCanvas.offsetHeight;
      }
      
      analyser.getByteFrequencyData(dataArray);
      
      // Effacer le canvas
      waveformCtx.clearRect(0, 0, waveformCanvas.width, waveformCanvas.height);
      
      // Configurer le dessin
      const barWidth = (waveformCanvas.width / bufferLength) * 2.5;
      let x = 0;
      
      // Dessiner les barres de la waveform
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * waveformCanvas.height;
        
        // Couleur basée sur l'intensité
        const hue = 200 + (barHeight / waveformCanvas.height) * 60;
        waveformCtx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        
        // Dessiner la barre
        waveformCtx.fillRect(x, waveformCanvas.height - barHeight, barWidth, barHeight);
        
        x += barWidth + 1;
      }
      
      // Continuer l'animation
      if (isRecording && !isPaused) {
        requestAnimationFrame(draw);
      }
    }
    
    draw();
  }

  function pauseAudioVisualization() {
    // Arrêter temporairement le dessin
  }

  function resumeAudioVisualization() {
    // Reprendre le dessin
    if (isRecording && !isPaused) {
      drawWaveform();
    }
  }

  function stopAudioVisualization() {
    if (audioContext) {
      audioContext.close().catch(e => console.error('Erreur lors de la fermeture du contexte audio:', e));
      audioContext = null;
    }
    analyser = null;
    microphoneSource = null;
  }

  // Fonction pour empêcher la fermeture
  function preventPopupClose() {
    window.onbeforeunload = function(e) {
      e.preventDefault();
      e.returnValue = 'Un enregistrement est en cours. Arrêtez l\'enregistrement avant de fermer.';
      return e.returnValue;
    };
    console.log('Fermeture bloquée pendant l\'enregistrement');
  }

  function allowPopupClose() {
    window.onbeforeunload = null;
    console.log('Fermeture autorisée');
  }

  // Gestion de la déconnexion
  const logoutBtn = document.getElementById('logout-btn');
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('accessToken');
    authSection.style.display = 'block';
    recorderSection.style.display = 'none';
    tokenInput.value = '';
    authStatus.textContent = 'Vous êtes déconnecté.';
    authStatus.style.color = 'orange';
    
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop());
    }
    audioChunks = [];
    playback.style.display = 'none';
    playback.src = '';
    
    const uploadBtn = document.getElementById('upload-btn');
    if (uploadBtn) {
      uploadBtn.remove();
    }
    
    // Réinitialiser les éléments de visualisation
    waveformContainer.style.display = 'none';
    
    // Arrêter la visualisation audio
    stopAudioVisualization();
    
    startBtn.disabled = false;
    stopBtn.disabled = true;
    pauseBtn.disabled = true;
    pauseBtn.textContent = '⏸ Mettre en pause';
    pauseBtn.style.background = '#ffc107';
    recordingStatus.textContent = 'Prêt à enregistrer';
    recordingStatus.style.color = '#666';
    recordingWarning.style.display = 'none';
    
    isRecording = false;
    isPaused = false;
  });
});
