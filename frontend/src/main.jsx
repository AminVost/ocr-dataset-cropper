import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

const API = 'http://127.0.0.1:8000'

const I18N = {
  fa: {
    dir: 'rtl',
    language: 'زبان',
    persian: 'فارسی',
    english: 'English',
    brandTitle: 'Dataset Cropper',
    brandSubtitle: 'برای PaddleOCR / OCR Dataset',
    chooseImages: 'عکس‌ها را انتخاب کن',
    dropImages: 'یا اینجا Drag & Drop کن',
    noImages: 'هنوز عکسی اضافه نشده.',
    selectForDelete: 'انتخاب برای حذف',
    deleteSelected: 'حذف عکس‌های انتخاب‌شده',
    noImagesSelected: 'هیچ عکسی برای حذف انتخاب نشده.',
    deletedImages: '{count} عکس حذف شد.',
    deleteImageError: 'خطا در حذف عکس: {error}',
    seller: 'Seller',
    startImageNumber: 'شماره شروع عکس',
    currentImageNumber: 'شماره عکس فعلی',
    row: 'Row',
    zoom: 'Zoom',
    saveCrop: 'ذخیره کراپ',
    saveAndNext: 'ذخیره + ردیف بعدی',
    saveDir: 'مسیر ذخیره‌سازی خروجی',
    saveDirPlaceholder: 'مثلا C:\\datasets\\rabin_crops یا /home/user/datasets/rabin',
    chooseFolder: 'انتخاب پوشه',
    setPath: 'ثبت مسیر',
    lockSize: 'سایز کراپ ثابت باشد',
    lockX: 'X ثابت باشد؛ فقط Y عوض شود',
    overwrite: 'اگر فایل وجود داشت overwrite شود',
    stepY: 'Step Y',
    batchCount: 'تعداد گروهی',
    setTemplate: 'ثبت ناحیه به عنوان Template',
    batchStep: 'کراپ گروهی با Step',
    nextOutputName: 'نام خروجی بعدی:',
    noRect: 'هنوز ناحیه‌ای انتخاب نشده',
    addImagesHint: 'یک یا چند عکس اضافه کن.',
    hotkeys: 'کلیدهای سریع:',
    arrowMove: 'Arrow = جابه‌جایی ۱px',
    shiftMove: 'Shift + Arrow = جابه‌جایی ۱۰px',
    enterSave: 'Enter = ذخیره',
    nSaveNext: 'N = ذخیره و ردیف بعدی',
    tTemplate: 'T = ثبت Template',
    zUndo: 'Ctrl + Z = برگشت تغییر محدوده',
    delDelete: 'Delete = حذف عکس‌های انتخاب‌شده',
    unknownError: 'خطای نامشخص',
    backendOffline: 'Backend وصل نیست یا خطا دارد: {error}',
    imagesAdded: '{count} عکس اضافه شد.',
    uploadError: 'خطا در اضافه کردن عکس: {error}',
    saveDirSet: 'مسیر ذخیره‌سازی تنظیم شد.',
    chooseDirError: 'انتخاب مسیر از پنجره ممکن نشد. مسیر را دستی وارد کن. {error}',
    saveDirSaved: 'مسیر ذخیره‌سازی ذخیره شد.',
    saveDirError: 'خطا در ذخیره مسیر: {error}',
    chooseImageRect: 'اول یک عکس و یک ناحیه کراپ انتخاب کن.',
    selectBaseRect: 'اول یک ناحیه پایه انتخاب کن.',
    saved: 'ذخیره شد: {filename}',
    cropError: 'خطا در کراپ: {error}',
    batchSaved: '{count} کراپ پشت‌سرهم ذخیره شد.',
    batchError: 'خطا در کراپ گروهی: {error}',
  },
  en: {
    dir: 'ltr',
    language: 'Language',
    persian: 'فارسی',
    english: 'English',
    brandTitle: 'Dataset Cropper',
    brandSubtitle: 'For PaddleOCR / OCR Dataset',
    chooseImages: 'Select images',
    dropImages: 'or Drag & Drop here',
    noImages: 'No images added yet.',
    selectForDelete: 'Select for delete',
    deleteSelected: 'Delete selected images',
    noImagesSelected: 'No image selected for delete.',
    deletedImages: '{count} image(s) deleted.',
    deleteImageError: 'Delete image error: {error}',
    seller: 'Seller',
    startImageNumber: 'Start image number',
    currentImageNumber: 'Current image number',
    row: 'Row',
    zoom: 'Zoom',
    saveCrop: 'Save crop',
    saveAndNext: 'Save + next row',
    saveDir: 'Output save directory',
    saveDirPlaceholder: 'Example: C:\\datasets\\rabin_crops or /home/user/datasets/rabin',
    chooseFolder: 'Choose folder',
    setPath: 'Set path',
    lockSize: 'Keep crop size fixed',
    lockX: 'Lock X; change only Y',
    overwrite: 'Overwrite if file exists',
    stepY: 'Step Y',
    batchCount: 'Batch count',
    setTemplate: 'Set current area as template',
    batchStep: 'Batch crop with Step',
    nextOutputName: 'Next output name:',
    noRect: 'No area selected yet',
    addImagesHint: 'Add one or more images.',
    hotkeys: 'Hotkeys:',
    arrowMove: 'Arrow = move 1px',
    shiftMove: 'Shift + Arrow = move 10px',
    enterSave: 'Enter = save',
    nSaveNext: 'N = save and next row',
    tTemplate: 'T = set template',
    zUndo: 'Ctrl + Z = undo crop area change',
    delDelete: 'Delete = delete selected images',
    unknownError: 'Unknown error',
    backendOffline: 'Backend is not connected or has an error: {error}',
    imagesAdded: '{count} image(s) added.',
    uploadError: 'Error adding images: {error}',
    saveDirSet: 'Save directory has been set.',
    chooseDirError: 'Folder dialog is not available. Enter the path manually. {error}',
    saveDirSaved: 'Save directory saved.',
    saveDirError: 'Error saving directory: {error}',
    chooseImageRect: 'Select an image and a crop area first.',
    selectBaseRect: 'Select a base area first.',
    saved: 'Saved: {filename}',
    cropError: 'Crop error: {error}',
    batchSaved: '{count} crops saved in sequence.',
    batchError: 'Batch crop error: {error}',
  },
}

function pad(num, size) {
  return String(num || 0).padStart(size, '0')
}

function filenamePreview(seller, imageNumber, rowNumber) {
  const cleanSeller = String(seller || 'seller')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '') || 'seller'

  return `${cleanSeller}_${pad(imageNumber, 3)}_row_${pad(rowNumber, 2)}.png`
}

function App() {
  const canvasRef = useRef(null)
  const imageRef = useRef(null)
  const dragStartRef = useRef(null)
  const resizeRef = useRef(null)
  const undoStackRef = useRef([])
  const mouseRef = useRef({ x: 0, y: 0 })

  const [lang, setLang] = useState(() => localStorage.getItem('dataset_cropper_lang') || 'fa')
  const t = I18N[lang] || I18N.fa

  const [images, setImages] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [checkedImageIds, setCheckedImageIds] = useState([])
  const [saveDir, setSaveDir] = useState('')
  const [seller, setSeller] = useState('rabin')
  const [startImageNumber, setStartImageNumber] = useState(1)
  const [manualImageNumber, setManualImageNumber] = useState('')
  const [rowNumber, setRowNumber] = useState(1)
  const [rect, setRect] = useState(null)
  const [templateRect, setTemplateRect] = useState(null)
  const [lockSize, setLockSize] = useState(true)
  const [lockX, setLockX] = useState(true)
  const [rowStep, setRowStep] = useState(0)
  const [batchCount, setBatchCount] = useState(10)
  const [zoom, setZoom] = useState(0.8)
  const [isDrawing, setIsDrawing] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [message, setMessage] = useState('')
  const [overwrite, setOverwrite] = useState(true)

  useEffect(() => {
    localStorage.setItem('dataset_cropper_lang', lang)
    document.documentElement.lang = lang
    document.documentElement.dir = t.dir
  }, [lang, t.dir])

  const tr = useCallback((key, values = {}) => {
    let text = (I18N[lang] || I18N.fa)[key] || key
    Object.entries(values).forEach(([name, value]) => {
      text = text.replaceAll(`{${name}}`, String(value))
    })
    return text
  }, [lang])

  const selectedIndex = images.findIndex((img) => img.id === selectedId)
  const selectedImage = selectedIndex >= 0 ? images[selectedIndex] : null

  const imageNumber = useMemo(() => {
    const manual = Number(manualImageNumber)
    if (Number.isFinite(manual) && manual > 0) return manual
    return Number(startImageNumber || 1) + Math.max(selectedIndex, 0)
  }, [manualImageNumber, startImageNumber, selectedIndex])

  const previewName = filenamePreview(seller, imageNumber, rowNumber)

  const showMessage = (text) => {
    setMessage(text)
  }

  const cloneRect = (value) => (value ? { ...value } : null)

  const pushUndo = useCallback(() => {
    undoStackRef.current.push({
      rect: cloneRect(rect),
      templateRect: cloneRect(templateRect),
      rowNumber,
    })
    if (undoStackRef.current.length > 80) undoStackRef.current.shift()
  }, [rect, templateRect, rowNumber])

  const undoLast = useCallback(() => {
    const previous = undoStackRef.current.pop()
    if (!previous) return
    setRect(previous.rect)
    setTemplateRect(previous.templateRect)
    setRowNumber(previous.rowNumber)
  }, [])

  const fetchJson = async (url, options = {}) => {
    const res = await fetch(`${API}${url}`, options)
    const text = await res.text()
    let data = {}
    try {
      data = text ? JSON.parse(text) : {}
    } catch {
      data = { detail: text }
    }
    if (!res.ok) {
      throw new Error(data.detail || tr('unknownError'))
    }
    return data
  }

  const loadInitial = useCallback(async () => {
    try {
      const [configData, imagesData] = await Promise.all([
        fetchJson('/api/config'),
        fetchJson('/api/images'),
      ])
      setSaveDir(configData.save_dir || '')
      setImages(imagesData.images || [])
      setCheckedImageIds([])
      if ((imagesData.images || []).length > 0) {
        setSelectedId((imagesData.images || [])[0].id)
      }
    } catch (err) {
      showMessage(tr('backendOffline', { error: err.message }))
    }
  }, [tr])

  useEffect(() => {
    loadInitial()
  }, [loadInitial])

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const img = imageRef.current
    if (!canvas || !img || !selectedImage) return

    const displayW = Math.max(1, Math.round(selectedImage.width * zoom))
    const displayH = Math.max(1, Math.round(selectedImage.height * zoom))
    canvas.width = displayW
    canvas.height = displayH

    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(img, 0, 0, displayW, displayH)

    const drawRect = (r, color, label, withHandles = false) => {
      if (!r) return
      ctx.save()
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.setLineDash([])
      ctx.strokeRect(r.x * zoom, r.y * zoom, r.w * zoom, r.h * zoom)
      ctx.fillStyle = 'rgba(0,0,0,0.6)'
      ctx.fillRect(r.x * zoom, Math.max(0, r.y * zoom - 24), 230, 22)
      ctx.fillStyle = '#fff'
      ctx.font = '13px Arial'
      ctx.fillText(label, r.x * zoom + 8, Math.max(16, r.y * zoom - 8))

      if (withHandles) {
        const size = 9
        const points = [
          [r.x, r.y],
          [r.x + r.w / 2, r.y],
          [r.x + r.w, r.y],
          [r.x, r.y + r.h / 2],
          [r.x + r.w, r.y + r.h / 2],
          [r.x, r.y + r.h],
          [r.x + r.w / 2, r.y + r.h],
          [r.x + r.w, r.y + r.h],
        ]
        ctx.fillStyle = color
        points.forEach(([px, py]) => {
          ctx.fillRect(px * zoom - size / 2, py * zoom - size / 2, size, size)
        })
      }

      ctx.restore()
    }

    drawRect(rect, '#00ff95', `${previewName} | ${Math.round(rect?.w || 0)}×${Math.round(rect?.h || 0)}`, true)

    if (templateRect && templateRect !== rect) {
      ctx.save()
      ctx.strokeStyle = '#ffd166'
      ctx.lineWidth = 1
      ctx.setLineDash([6, 4])
      ctx.strokeRect(templateRect.x * zoom, templateRect.y * zoom, templateRect.w * zoom, templateRect.h * zoom)
      ctx.restore()
    }
  }, [rect, selectedImage, templateRect, zoom, previewName])

  useEffect(() => {
    drawCanvas()
  }, [drawCanvas])

  const onImageLoad = () => {
    drawCanvas()
  }

  const canvasPoint = (event) => {
    const canvas = canvasRef.current
    const bounds = canvas.getBoundingClientRect()
    return {
      x: Math.max(0, (event.clientX - bounds.left) / zoom),
      y: Math.max(0, (event.clientY - bounds.top) / zoom),
    }
  }

  const clampRectToImage = (r) => {
    if (!selectedImage) return r
    const x = Math.max(0, Math.min(r.x, selectedImage.width - 1))
    const y = Math.max(0, Math.min(r.y, selectedImage.height - 1))
    const w = Math.max(1, Math.min(r.w, selectedImage.width - x))
    const h = Math.max(1, Math.min(r.h, selectedImage.height - y))
    return { x, y, w, h }
  }

  const getResizeHandle = (point, targetRect = rect) => {
    if (!targetRect) return null
    const tolerance = 10 / zoom
    const left = Math.abs(point.x - targetRect.x) <= tolerance
    const right = Math.abs(point.x - (targetRect.x + targetRect.w)) <= tolerance
    const top = Math.abs(point.y - targetRect.y) <= tolerance
    const bottom = Math.abs(point.y - (targetRect.y + targetRect.h)) <= tolerance
    const middleX = Math.abs(point.x - (targetRect.x + targetRect.w / 2)) <= tolerance
    const middleY = Math.abs(point.y - (targetRect.y + targetRect.h / 2)) <= tolerance
    const insideX = point.x >= targetRect.x - tolerance && point.x <= targetRect.x + targetRect.w + tolerance
    const insideY = point.y >= targetRect.y - tolerance && point.y <= targetRect.y + targetRect.h + tolerance

    if (left && top) return 'nw'
    if (right && top) return 'ne'
    if (left && bottom) return 'sw'
    if (right && bottom) return 'se'
    if (middleX && top) return 'n'
    if (middleX && bottom) return 's'
    if (left && middleY) return 'w'
    if (right && middleY) return 'e'
    if (top && insideX) return 'n'
    if (bottom && insideX) return 's'
    if (left && insideY) return 'w'
    if (right && insideY) return 'e'
    return null
  }

  const cursorForHandle = (handle) => ({
    n: 'ns-resize',
    s: 'ns-resize',
    e: 'ew-resize',
    w: 'ew-resize',
    nw: 'nwse-resize',
    se: 'nwse-resize',
    ne: 'nesw-resize',
    sw: 'nesw-resize',
  }[handle] || 'crosshair')

  const resizeRectFromPoint = (startRect, mode, point) => {
    let x1 = startRect.x
    let y1 = startRect.y
    let x2 = startRect.x + startRect.w
    let y2 = startRect.y + startRect.h

    if (mode.includes('w')) x1 = point.x
    if (mode.includes('e')) x2 = point.x
    if (mode.includes('n')) y1 = point.y
    if (mode.includes('s')) y2 = point.y

    return clampRectToImage({
      x: Math.min(x1, x2),
      y: Math.min(y1, y2),
      w: Math.abs(x2 - x1),
      h: Math.abs(y2 - y1),
    })
  }

  const applyFixedRectAtPoint = (point) => {
    if (!templateRect) return
    const next = {
      x: lockX ? templateRect.x : point.x,
      y: point.y,
      w: templateRect.w,
      h: templateRect.h,
    }
    setRect(clampRectToImage(next))
  }

  const handleMouseDown = (event) => {
    if (!selectedImage) return
    const point = canvasPoint(event)
    mouseRef.current = point

    const resizeHandle = getResizeHandle(point)
    if (resizeHandle && rect) {
      pushUndo()
      resizeRef.current = {
        mode: resizeHandle,
        startRect: { ...rect },
      }
      setIsResizing(true)
      return
    }

    if (lockSize && templateRect) {
      pushUndo()
      applyFixedRectAtPoint(point)
      return
    }

    pushUndo()
    dragStartRef.current = point
    setIsDrawing(true)
    setRect({ x: point.x, y: point.y, w: 1, h: 1 })
  }

  const handleMouseMove = (event) => {
    if (!selectedImage) return
    const point = canvasPoint(event)
    mouseRef.current = point

    if (isResizing && resizeRef.current) {
      const { mode, startRect } = resizeRef.current
      setRect(resizeRectFromPoint(startRect, mode, point))
      return
    }

    if (isDrawing && dragStartRef.current) {
      const start = dragStartRef.current
      const next = {
        x: Math.min(start.x, point.x),
        y: Math.min(start.y, point.y),
        w: Math.abs(point.x - start.x),
        h: Math.abs(point.y - start.y),
      }
      setRect(clampRectToImage(next))
      return
    }

    const canvas = canvasRef.current
    if (canvas) canvas.style.cursor = cursorForHandle(getResizeHandle(point))
  }

  const handleMouseUp = () => {
    if (isResizing) {
      setIsResizing(false)
      resizeRef.current = null
      setRect((current) => {
        if (!current || current.w < 2 || current.h < 2) return current
        const next = clampRectToImage(current)
        setTemplateRect(next)
        if (!rowStep) setRowStep(Math.round(next.h))
        return next
      })
      return
    }

    if (!isDrawing) return
    setIsDrawing(false)
    dragStartRef.current = null
    setRect((current) => {
      if (!current || current.w < 2 || current.h < 2) return current
      const next = clampRectToImage(current)
      setTemplateRect(next)
      if (!rowStep) setRowStep(Math.round(next.h))
      return next
    })
  }

  const uploadFiles = async (fileList) => {
    const files = Array.from(fileList || []).filter((file) => file.type.startsWith('image/'))
    if (!files.length) return

    const form = new FormData()
    files.forEach((file) => form.append('files', file))

    try {
      const data = await fetchJson('/api/images', { method: 'POST', body: form })
      const added = data.images || []
      setImages((prev) => [...prev, ...added])
      if (!selectedId && added[0]) setSelectedId(added[0].id)
      showMessage(tr('imagesAdded', { count: added.length }))
    } catch (err) {
      showMessage(tr('uploadError', { error: err.message }))
    }
  }

  const handleDrop = (event) => {
    event.preventDefault()
    uploadFiles(event.dataTransfer.files)
  }

  const chooseSaveDir = async () => {
    try {
      const data = await fetchJson('/api/config/choose-save-dir', { method: 'POST' })
      setSaveDir(data.save_dir || '')
      showMessage(tr('saveDirSet'))
    } catch (err) {
      showMessage(tr('chooseDirError', { error: err.message }))
    }
  }

  const saveManualDir = async () => {
    try {
      const data = await fetchJson('/api/config/save-dir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ save_dir: saveDir }),
      })
      setSaveDir(data.save_dir || '')
      showMessage(tr('saveDirSaved'))
    } catch (err) {
      showMessage(tr('saveDirError', { error: err.message }))
    }
  }

  const saveCrop = useCallback(async ({ goNext = false } = {}) => {
    if (!selectedImage || !rect) {
      showMessage(tr('chooseImageRect'))
      return
    }

    try {
      const payload = {
        image_id: selectedImage.id,
        seller,
        image_number: imageNumber,
        row_number: rowNumber,
        rect,
        save_dir: saveDir || undefined,
        overwrite,
      }
      const data = await fetchJson('/api/crop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      showMessage(tr('saved', { filename: data.saved.filename }))

      if (goNext) {
        pushUndo()
        setRowNumber((prev) => Number(prev) + 1)
        setRect((current) => {
          if (!current) return current
          return clampRectToImage({ ...current, y: current.y + Number(rowStep || current.h) })
        })
      }
    } catch (err) {
      showMessage(tr('cropError', { error: err.message }))
    }
  }, [selectedImage, rect, seller, imageNumber, rowNumber, saveDir, overwrite, rowStep, tr, pushUndo])

  const batchCrop = async () => {
    if (!selectedImage || !rect) {
      showMessage(tr('selectBaseRect'))
      return
    }

    try {
      const payload = {
        image_id: selectedImage.id,
        seller,
        image_number: imageNumber,
        start_row: rowNumber,
        count: Number(batchCount || 1),
        rect,
        step_y: Number(rowStep || rect.h),
        save_dir: saveDir || undefined,
        overwrite,
      }
      const data = await fetchJson('/api/crop/batch-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      showMessage(tr('batchSaved', { count: data.saved.length }))
      pushUndo()
      setRowNumber((prev) => Number(prev) + Number(batchCount || 1))
    } catch (err) {
      showMessage(tr('batchError', { error: err.message }))
    }
  }

  const toggleImageChecked = (id) => {
    setCheckedImageIds((prev) => (
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    ))
  }

  const deleteCheckedImages = useCallback(async () => {
    const ids = checkedImageIds.length ? checkedImageIds : (selectedId ? [selectedId] : [])
    if (!ids.length) {
      showMessage(tr('noImagesSelected'))
      return
    }

    try {
      const data = await fetchJson('/api/images/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      })
      const deletedIds = data.deleted_ids || ids
      const nextImages = images.filter((img) => !deletedIds.includes(img.id))

      setImages(nextImages)
      setCheckedImageIds((prev) => prev.filter((id) => !deletedIds.includes(id)))
      setSelectedId((current) => (deletedIds.includes(current) ? (nextImages[0]?.id || null) : current))

      if (deletedIds.includes(selectedId)) {
        setRect(null)
        setTemplateRect(null)
        setRowNumber(1)
      }

      showMessage(tr('deletedImages', { count: deletedIds.length }))
    } catch (err) {
      showMessage(tr('deleteImageError', { error: err.message }))
    }
  }, [checkedImageIds, selectedId, images, tr])

  const moveRect = useCallback((dx, dy) => {
    if (!rect) return
    pushUndo()
    setRect((current) => {
      if (!current) return current
      return clampRectToImage({ ...current, x: current.x + dx, y: current.y + dy })
    })
  }, [selectedImage, rect, pushUndo])

  useEffect(() => {
    const handler = (event) => {
      const activeTag = document.activeElement?.tagName
      const isFormField = ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag)

      if (event.ctrlKey && event.key.toLowerCase() === 'z' && !isFormField) {
        event.preventDefault()
        undoLast()
        return
      }

      if (isFormField) return

      const fast = event.shiftKey ? 10 : 1
      if (event.key === 'ArrowUp') { event.preventDefault(); moveRect(0, -fast) }
      if (event.key === 'ArrowDown') { event.preventDefault(); moveRect(0, fast) }
      if (event.key === 'ArrowLeft') { event.preventDefault(); moveRect(-fast, 0) }
      if (event.key === 'ArrowRight') { event.preventDefault(); moveRect(fast, 0) }
      if (event.key === 'Enter') { event.preventDefault(); saveCrop({ goNext: false }) }
      if (event.key === 'Delete') { event.preventDefault(); deleteCheckedImages() }
      if (event.key.toLowerCase() === 'n') { event.preventDefault(); saveCrop({ goNext: true }) }
      if (event.key.toLowerCase() === 't') {
        event.preventDefault()
        if (rect) {
          pushUndo()
          setTemplateRect(rect)
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [moveRect, rect, saveCrop, undoLast, pushUndo, deleteCheckedImages])

  const selectImage = (id) => {
    setSelectedId(id)
    setRect(null)
    setTemplateRect(null)
    setRowNumber(1)
    setManualImageNumber('')
    showMessage('')
  }

  const loadCurrentImageUrl = selectedImage ? `${API}${selectedImage.url}?v=${selectedImage.id}` : ''

  return (
    <div className="app" dir={t.dir} data-lang={lang} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-row">
            <div>
              <div className="brand-title">{t.brandTitle}</div>
              <div className="brand-subtitle">{t.brandSubtitle}</div>
            </div>
            <label className="language-control">
              <span>{t.language}</span>
              <select value={lang} onChange={(e) => setLang(e.target.value)}>
                <option value="fa">{t.persian}</option>
                <option value="en">{t.english}</option>
              </select>
            </label>
          </div>
        </div>

        <label className="upload-box">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => uploadFiles(e.target.files)}
          />
          <strong>{t.chooseImages}</strong>
          <span>{t.dropImages}</span>
        </label>

        <div className="sidebar-actions">
          <button className="danger" onClick={deleteCheckedImages}>{t.deleteSelected}</button>
        </div>

        <div className="image-list">
          {images.map((img, idx) => (
            <div key={img.id} className={`image-row ${img.id === selectedId ? 'active' : ''}`}>
              <label className="image-check" title={t.selectForDelete}>
                <input
                  type="checkbox"
                  checked={checkedImageIds.includes(img.id)}
                  onChange={() => toggleImageChecked(img.id)}
                />
              </label>
              <button
                className={`image-item ${img.id === selectedId ? 'active' : ''}`}
                onClick={() => selectImage(img.id)}
              >
                <span>{pad(Number(startImageNumber || 1) + idx, 3)} - {img.original_name}</span>
                <small>{img.width}×{img.height}</small>
              </button>
            </div>
          ))}
          {!images.length && <div className="empty">{t.noImages}</div>}
        </div>
      </aside>

      <main className="main">
        <header className="toolbar">
          <div className="field small">
            <label>{t.seller}</label>
            <input value={seller} onChange={(e) => setSeller(e.target.value)} placeholder="rabin" />
          </div>

          <div className="field mini">
            <label>{t.startImageNumber}</label>
            <input type="number" min="1" value={startImageNumber} onChange={(e) => setStartImageNumber(Number(e.target.value))} />
          </div>

          <div className="field mini">
            <label>{t.currentImageNumber}</label>
            <input
              type="number"
              min="1"
              value={manualImageNumber || imageNumber}
              onChange={(e) => setManualImageNumber(e.target.value)}
            />
          </div>

          <div className="field mini">
            <label>{t.row}</label>
            <input type="number" min="1" value={rowNumber} onChange={(e) => setRowNumber(Number(e.target.value))} />
          </div>

          <div className="field mini">
            <label>{t.zoom}</label>
            <select value={zoom} onChange={(e) => setZoom(Number(e.target.value))}>
              <option value="0.4">40%</option>
              <option value="0.6">60%</option>
              <option value="0.8">80%</option>
              <option value="1">100%</option>
              <option value="1.25">125%</option>
              <option value="1.5">150%</option>
              <option value="2">200%</option>
            </select>
          </div>

          <button className="primary" onClick={() => saveCrop({ goNext: false })}>{t.saveCrop}</button>
          <button className="success" onClick={() => saveCrop({ goNext: true })}>{t.saveAndNext}</button>
        </header>

        <section className="save-bar">
          <div className="field path-field">
            <label>{t.saveDir}</label>
            <input
              value={saveDir}
              onChange={(e) => setSaveDir(e.target.value)}
              placeholder={t.saveDirPlaceholder}
            />
          </div>
          <button onClick={chooseSaveDir}>{t.chooseFolder}</button>
          <button onClick={saveManualDir}>{t.setPath}</button>
        </section>

        <section className="options-bar">
          <label className="check">
            <input type="checkbox" checked={lockSize} onChange={(e) => setLockSize(e.target.checked)} />
            {t.lockSize}
          </label>
          <label className="check">
            <input type="checkbox" checked={lockX} onChange={(e) => setLockX(e.target.checked)} />
            {t.lockX}
          </label>
          <label className="check">
            <input type="checkbox" checked={overwrite} onChange={(e) => setOverwrite(e.target.checked)} />
            {t.overwrite}
          </label>
          <div className="field mini">
            <label>{t.stepY}</label>
            <input type="number" min="1" value={rowStep} onChange={(e) => setRowStep(Number(e.target.value))} />
          </div>
          <div className="field mini">
            <label>{t.batchCount}</label>
            <input type="number" min="1" max="500" value={batchCount} onChange={(e) => setBatchCount(Number(e.target.value))} />
          </div>
          <button onClick={() => rect && setTemplateRect(rect)}>{t.setTemplate}</button>
          <button onClick={batchCrop}>{t.batchStep}</button>
        </section>

        <section className="status-bar">
          <div>{t.nextOutputName} <code>{previewName}</code></div>
          <div>
            {rect ? `x:${Math.round(rect.x)} y:${Math.round(rect.y)} w:${Math.round(rect.w)} h:${Math.round(rect.h)}` : t.noRect}
          </div>
        </section>

        {message && <div className="message">{message}</div>}

        <section className="canvas-wrap">
          {!selectedImage && <div className="empty big">{t.addImagesHint}</div>}
          {selectedImage && (
            <>
              <img
                ref={imageRef}
                alt="source"
                src={loadCurrentImageUrl}
                onLoad={onImageLoad}
                className="hidden-image"
              />
              <canvas
                ref={canvasRef}
                className="crop-canvas"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
            </>
          )}
        </section>

        <footer className="help">
          <strong>{t.hotkeys}</strong>
          <span>{t.arrowMove}</span>
          <span>{t.shiftMove}</span>
          <span>{t.enterSave}</span>
          <span>{t.nSaveNext}</span>
          <span>{t.tTemplate}</span>
          <span>{t.zUndo}</span>
          <span>{t.delDelete}</span>
        </footer>
      </main>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)
