document.addEventListener('DOMContentLoaded', () => {
    try {
        const NUM_SLIPS = 5;
        const A4_WIDTH_MM = 210;
        const A4_HEIGHT_MM = 297;

        // UI Elements - Modes and Tabs
        const modeRadios = document.querySelectorAll('input[name="input-mode"]');
        const slipTabsContainer = document.getElementById('slip-tabs');
        const slipTabs = document.querySelectorAll('.slip-tab');
        
        // UI Elements - Inputs
        const topTextInput = document.getElementById('top-text');
        const bottomCol1Input = document.getElementById('bottom-col1');
        const bottomCol2Input = document.getElementById('bottom-col2');
        const bottomCol3Input = document.getElementById('bottom-col3');
        const fontSelect = document.getElementById('font-select');
        
        const topFontSizeSelect = document.getElementById('top-font-size');
        const topFontSizeVal = document.getElementById('top-font-size-val');
        
        const bottomFs1Input = document.getElementById('bottom-fs1');
        const bottomFs2Input = document.getElementById('bottom-fs2');
        const bottomFs3Input = document.getElementById('bottom-fs3');
        const bottomFs1Val = document.getElementById('bottom-fs1-val');
        const bottomFs2Val = document.getElementById('bottom-fs2-val');
        const bottomFs3Val = document.getElementById('bottom-fs3-val');
        
        const bottomPos1Input = document.getElementById('bottom-pos1');
        const bottomPos2Input = document.getElementById('bottom-pos2');
        const bottomPos3Input = document.getElementById('bottom-pos3');
        const bottomPos1Val = document.getElementById('bottom-pos1-val');
        const bottomPos2Val = document.getElementById('bottom-pos2-val');
        const bottomPos3Val = document.getElementById('bottom-pos3-val');
        
        const bottomSizeAutoCheckbox = document.getElementById('bottom-size-auto');
        const matchTopSizeCheckbox = document.getElementById('match-top-size');
        const alignTopCheckbox = document.getElementById('align-top-checkbox');
        
        const bottomLs1Input = document.getElementById('bottom-ls1');
        const bottomLs2Input = document.getElementById('bottom-ls2');
        const bottomLs3Input = document.getElementById('bottom-ls3');
        const bottomLs1Val = document.getElementById('bottom-ls1-val');
        const bottomLs2Val = document.getElementById('bottom-ls2-val');
        const bottomLs3Val = document.getElementById('bottom-ls3-val');
        
        const topPosInput = document.getElementById('top-pos');
        const topPosVal = document.getElementById('top-pos-val');
        const bottomPosInput = document.getElementById('bottom-pos');
        const bottomPosVal = document.getElementById('bottom-pos-val');
        const slipHeightInput = document.getElementById('slip-height');
        const slipHeightVal = document.getElementById('slip-height-val');
        const saveDefaultCheck = document.getElementById('save-default-check');
        
        // Print and Preview
        const printBtn = document.getElementById('print-btn');
        const previewWrapper = document.getElementById('preview-wrapper');
        const sheetPreview = document.getElementById('sheet-preview');
        const sheetPrint = document.getElementById('sheet-print');
        const previewArea = document.getElementById('preview-area');

        // State Management
        let currentMode = 'batch';
        let currentActiveTabIndex = 0;
        
        // Factory for default slip state
        const createDefaultState = () => ({
            topText: '御祝',
            col1: '',
            col2: '親和会',
            col3: '',
            topFontSize: '22',
            bottomFs1: '22',
            bottomFs2: '22',
            bottomFs3: '22',
            bottomPos1: '0',
            bottomPos2: '0',
            bottomPos3: '0',
            fontFamily: "'HG行書体', 'HGP行書体', 'Yuji Syuku', serif",
            topPosMm: '15',
            bottomPosMm: '60',
            bottomSizeAuto: true,
            matchTopSize: false,
            alignTop: false,
            bottomLs1: '2',
            bottomLs2: '2',
            bottomLs3: '2'
        });

        const slipsData = Array(NUM_SLIPS).fill(null).map(createDefaultState);
        const batchData = createDefaultState();
        let globalSlipHeightMm = '185';
        
        const SAVED_STATE_KEY = 'noshibukuro_saved_state';
        try {
            const raw = localStorage.getItem(SAVED_STATE_KEY);
            if (raw) {
                const saved = JSON.parse(raw);
                if (saved.batchData) {
                    // migrate old bottomFontSize to fs1,fs2,fs3 if needed
                    if (saved.batchData.bottomFontSize) {
                        saved.batchData.bottomFs1 = saved.batchData.bottomFontSize;
                        saved.batchData.bottomFs2 = saved.batchData.bottomFontSize;
                        saved.batchData.bottomFs3 = saved.batchData.bottomFontSize;
                    }
                    Object.assign(batchData, saved.batchData);
                }
                if (saved.slipsData) {
                    for (let i = 0; i < NUM_SLIPS; i++) {
                        if (saved.slipsData[i]) {
                            if (saved.slipsData[i].bottomFontSize) {
                                saved.slipsData[i].bottomFs1 = saved.slipsData[i].bottomFontSize;
                                saved.slipsData[i].bottomFs2 = saved.slipsData[i].bottomFontSize;
                                saved.slipsData[i].bottomFs3 = saved.slipsData[i].bottomFontSize;
                            }
                            Object.assign(slipsData[i], saved.slipsData[i]);
                        }
                    }
                }
                if (saved.globalSlipHeightMm) globalSlipHeightMm = saved.globalSlipHeightMm;
                if (saved.autoSaveEnabled) saveDefaultCheck.checked = true;
                if (saved.currentMode) currentMode = saved.currentMode;
            }
        } catch (e) {
            console.error("Failed to load state", e);
        }
        
        slipHeightInput.value = globalSlipHeightMm;

        // Load data into UI forms
        function loadStateIntoForm(state) {
            topTextInput.value = state.topText;
            bottomCol1Input.value = state.col1;
            bottomCol2Input.value = state.col2;
            bottomCol3Input.value = state.col3;
            fontSelect.value = state.fontFamily;
            
            topFontSizeSelect.value = state.topFontSize;
            bottomFs1Input.value = state.bottomFs1;
            bottomFs2Input.value = state.bottomFs2;
            bottomFs3Input.value = state.bottomFs3;
            
            bottomPos1Input.value = state.bottomPos1 || '0';
            bottomPos2Input.value = state.bottomPos2 || '0';
            bottomPos3Input.value = state.bottomPos3 || '0';
            
            bottomSizeAutoCheckbox.checked = state.bottomSizeAuto;
            matchTopSizeCheckbox.checked = state.matchTopSize;
            alignTopCheckbox.checked = state.alignTop;
            
            bottomLs1Input.value = state.bottomLs1 || '2';
            bottomLs2Input.value = state.bottomLs2 || '2';
            bottomLs3Input.value = state.bottomLs3 || '2';
            
            topPosInput.value = state.topPosMm;
            bottomPosInput.value = state.bottomPosMm;
            
            updateFormLabels(state);
            updateDisabledStates(state);
        }

        // Save UI form into data
        function saveFormIntoState(state) {
            state.topText = topTextInput.value;
            state.col1 = bottomCol1Input.value;
            state.col2 = bottomCol2Input.value;
            state.col3 = bottomCol3Input.value;
            state.fontFamily = fontSelect.value;
            
            state.topFontSize = topFontSizeSelect.value;
            state.bottomFs1 = bottomFs1Input.value;
            state.bottomFs2 = bottomFs2Input.value;
            state.bottomFs3 = bottomFs3Input.value;
            
            state.bottomPos1 = bottomPos1Input.value;
            state.bottomPos2 = bottomPos2Input.value;
            state.bottomPos3 = bottomPos3Input.value;
            
            state.bottomSizeAuto = bottomSizeAutoCheckbox.checked;
            state.matchTopSize = matchTopSizeCheckbox.checked;
            state.alignTop = alignTopCheckbox.checked;
            
            state.bottomLs1 = bottomLs1Input.value;
            state.bottomLs2 = bottomLs2Input.value;
            state.bottomLs3 = bottomLs3Input.value;
            
            state.topPosMm = topPosInput.value;
            state.bottomPosMm = bottomPosInput.value;
        }

        function updateFormLabels(state) {
            topFontSizeVal.value = state.topFontSize;
            bottomFs1Val.value = state.bottomFs1;
            bottomFs2Val.value = state.bottomFs2;
            bottomFs3Val.value = state.bottomFs3;
            bottomPos1Val.value = ((state.bottomPos1 || 0) / 10).toFixed(1);
            bottomPos2Val.value = ((state.bottomPos2 || 0) / 10).toFixed(1);
            bottomPos3Val.value = ((state.bottomPos3 || 0) / 10).toFixed(1);
            
            bottomLs1Val.value = state.bottomLs1 || '2';
            bottomLs2Val.value = state.bottomLs2 || '2';
            bottomLs3Val.value = state.bottomLs3 || '2';
            
            topPosVal.value = (state.topPosMm / 10).toFixed(1);
            bottomPosVal.value = (state.bottomPosMm / 10).toFixed(1);
            slipHeightVal.value = (globalSlipHeightMm / 10).toFixed(1);
        }

        function updateDisabledStates(state) {
            const disabled = state.bottomSizeAuto || state.matchTopSize;
            bottomFs1Input.disabled = disabled;
            bottomFs2Input.disabled = disabled;
            bottomFs3Input.disabled = disabled;
        }

        // Handle input changes
        function handleInput() {
            globalSlipHeightMm = slipHeightInput.value;
            slipHeightVal.value = (globalSlipHeightMm / 10).toFixed(1);
            
            if (currentMode === 'batch') {
                saveFormIntoState(batchData);
            } else {
                saveFormIntoState(slipsData[currentActiveTabIndex]);
            }
            
            const activeState = currentMode === 'batch' ? batchData : slipsData[currentActiveTabIndex];
            updateFormLabels(activeState);
            updateDisabledStates(activeState);
            
            if (saveDefaultCheck.checked) {
                const stateToSave = {
                    batchData,
                    slipsData,
                    globalSlipHeightMm,
                    currentMode,
                    autoSaveEnabled: true
                };
                localStorage.setItem(SAVED_STATE_KEY, JSON.stringify(stateToSave));
            }
            
            renderSlips();
        }

        function escapeHtml(str) {
            return String(str).replace(/[&<>"']/g, ch => ({
                '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
            }[ch]));
        }

        // Auto font size based on column count and text length (monotonically shrinks as text grows)
        function computeAutoFontSize(text, columnsCount) {
            let base = 22;
            if (columnsCount === 3) base = 14;
            else if (columnsCount === 2) base = 16;

            const len = text.length;
            if (len > 10) base = Math.min(base, 10);
            else if (len > 8) base = Math.min(base, 12);
            else if (len > 6) base = Math.min(base, 16);
            else if (len > 4) base = Math.min(base, 18);

            return `${base}pt`;
        }

        function generateSlipHtml(state) {
            const topText = escapeHtml(state.topText);
            const col1 = state.col1.trim();
            const col2 = state.col2.trim();
            const col3 = state.col3.trim();
            
            const topFontSizePt = state.topFontSize + 'pt';
            const fontFamily = state.fontFamily;
            const topPosMm = state.topPosMm;
            const bottomPosMm = state.bottomPosMm;

            const columns = [];
            if (col1) columns.push({ text: col1, fs: state.bottomFs1, pos: state.bottomPos1 || '0', ls: state.bottomLs1 || '2' });
            if (col2) columns.push({ text: col2, fs: state.bottomFs2, pos: state.bottomPos2 || '0', ls: state.bottomLs2 || '2' });
            if (col3) columns.push({ text: col3, fs: state.bottomFs3, pos: state.bottomPos3 || '0', ls: state.bottomLs3 || '2' });

            const alignItems = state.alignTop ? 'flex-start' : 'flex-end';

            let columnsHtml = '';
            columns.forEach(col => {
                const text = escapeHtml(col.text);
                let manualFs = col.fs + 'pt';

                if (state.matchTopSize) {
                    manualFs = topFontSizePt;
                }

                const letterSpacingStyle = `letter-spacing: ${col.ls}px;`;
                const relativeTop = -(col.pos); // positive pos moves text UP

                let colStyle = `font-size: ${manualFs}; font-family: ${fontFamily}; ${letterSpacingStyle}; position: relative; top: ${relativeTop}mm;`;

                if (state.bottomSizeAuto) {
                    const autoFs = computeAutoFontSize(col.text, columns.length);
                    colStyle = `font-size: ${autoFs}; font-family: ${fontFamily}; ${letterSpacingStyle}; position: relative; top: ${relativeTop}mm;`;
                }

                columnsHtml += `
                    <div class="text-vertical" style="${colStyle}">
                        ${text}
                    </div>
                `;
            });

            return `
                <div class="slip" style="height: ${globalSlipHeightMm}mm;">
                    <div class="text-top" style="top: ${topPosMm}mm; font-family: ${fontFamily};">
                        <div class="text-vertical" style="font-size: ${topFontSizePt};">${topText}</div>
                    </div>
                    <div class="text-bottom" style="bottom: ${bottomPosMm}mm;">
                        <div class="columns-wrapper" style="align-items: ${alignItems};">
                            ${columnsHtml}
                        </div>
                    </div>
                </div>
            `;
        }

        function renderSlips() {
            const sheetPaddingTopMm = (A4_HEIGHT_MM - globalSlipHeightMm) / 2;
            let fullSheetHtml = '';
            for (let i = 0; i < NUM_SLIPS; i++) {
                const stateToUse = currentMode === 'batch' ? batchData : slipsData[i];
                fullSheetHtml += generateSlipHtml(stateToUse);
            }
            [sheetPreview, sheetPrint].forEach(sheet => {
                sheet.style.paddingTop = `${sheetPaddingTopMm}mm`;
                sheet.innerHTML = fullSheetHtml;
            });
        }

        // Mode Switching
        modeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                currentMode = e.target.value;
                if (currentMode === 'batch') {
                    slipTabsContainer.style.display = 'none';
                    loadStateIntoForm(batchData);
                } else {
                    slipTabsContainer.style.display = 'flex';
                    loadStateIntoForm(slipsData[currentActiveTabIndex]);
                }
                if (saveDefaultCheck.checked) {
                    const stateToSave = { batchData, slipsData, globalSlipHeightMm, currentMode, autoSaveEnabled: true };
                    localStorage.setItem(SAVED_STATE_KEY, JSON.stringify(stateToSave));
                }
                renderSlips();
            });
        });

        // Tab Switching
        slipTabs.forEach((tab, index) => {
            tab.addEventListener('click', () => {
                slipTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                currentActiveTabIndex = index;
                loadStateIntoForm(slipsData[currentActiveTabIndex]);
            });
        });

        // Add event listeners to all form inputs
        const inputs = [
            topTextInput, bottomCol1Input, bottomCol2Input, bottomCol3Input, 
            fontSelect, topPosInput, bottomPosInput, topFontSizeSelect, 
            bottomFs1Input, bottomFs2Input, bottomFs3Input,
            bottomPos1Input, bottomPos2Input, bottomPos3Input,
            bottomLs1Input, bottomLs2Input, bottomLs3Input,
            matchTopSizeCheckbox, alignTopCheckbox, bottomSizeAutoCheckbox,
            slipHeightInput
        ];
        inputs.forEach(input => {
            input.addEventListener('input', handleInput);
            input.addEventListener('change', handleInput);
        });

        // Sync manual number inputs with their respective sliders
        function syncInputAndSlider(sliderElement, inputElement, isCm = false) {
            inputElement.addEventListener('change', (e) => {
                let val = parseFloat(e.target.value);
                if (isNaN(val)) return;
                if (isCm) {
                    sliderElement.value = val * 10;
                } else {
                    sliderElement.value = val;
                }
                handleInput();
            });
        }

        syncInputAndSlider(topFontSizeSelect, topFontSizeVal);
        syncInputAndSlider(bottomFs1Input, bottomFs1Val);
        syncInputAndSlider(bottomFs2Input, bottomFs2Val);
        syncInputAndSlider(bottomFs3Input, bottomFs3Val);
        syncInputAndSlider(bottomPos1Input, bottomPos1Val, true);
        syncInputAndSlider(bottomPos2Input, bottomPos2Val, true);
        syncInputAndSlider(bottomPos3Input, bottomPos3Val, true);
        syncInputAndSlider(bottomLs1Input, bottomLs1Val);
        syncInputAndSlider(bottomLs2Input, bottomLs2Val);
        syncInputAndSlider(bottomLs3Input, bottomLs3Val);
        syncInputAndSlider(topPosInput, topPosVal, true);
        syncInputAndSlider(bottomPosInput, bottomPosVal, true);
        syncInputAndSlider(slipHeightInput, slipHeightVal, true);

        saveDefaultCheck.addEventListener('change', () => {
            if (saveDefaultCheck.checked) {
                const stateToSave = { batchData, slipsData, globalSlipHeightMm, currentMode, autoSaveEnabled: true };
                localStorage.setItem(SAVED_STATE_KEY, JSON.stringify(stateToSave));
            } else {
                localStorage.removeItem(SAVED_STATE_KEY);
            }
        });

        // Scale preview
        function resizePreview() {
            const availableWidth = previewArea.clientWidth - 40;
            const availableHeight = previewArea.clientHeight - 40;
            const A4_WIDTH_PX = A4_WIDTH_MM * 3.7795;
            const A4_HEIGHT_PX = A4_HEIGHT_MM * 3.7795;
            const scaleX = availableWidth / A4_WIDTH_PX;
            const scaleY = availableHeight / A4_HEIGHT_PX;
            const scale = Math.min(scaleX, scaleY);
            previewWrapper.style.width = `${A4_WIDTH_MM}mm`;
            previewWrapper.style.height = `${A4_HEIGHT_MM}mm`;
            previewWrapper.style.transform = `scale(${scale})`;
        }

        window.addEventListener('resize', resizePreview);
        printBtn.addEventListener('click', () => window.print());

        // Initialize
        if (currentMode === 'individual') {
            document.querySelector('input[name="input-mode"][value="individual"]').checked = true;
            slipTabsContainer.style.display = 'flex';
            loadStateIntoForm(slipsData[currentActiveTabIndex]);
        } else {
            loadStateIntoForm(batchData);
        }
        renderSlips();
        setTimeout(resizePreview, 100);

    } catch(err) {
        document.body.innerHTML = `<div style="padding:20px; color:red; font-size:20px; background:white;">Error: ${err.message}<br><pre>${err.stack}</pre></div>`;
    }
});
