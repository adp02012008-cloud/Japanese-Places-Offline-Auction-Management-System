'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import {
  Landmark,
  Plus,
  Search,
  Upload,
  AlertCircle,
  Eye,
  Edit2,
  Trash2,
  RefreshCw,
  Coins,
  ShieldCheck,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/utils';
import { IPlace } from '@/types';

export default function AdminPlacesPage() {
  const [places, setPlaces] = useState<IPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Create / Edit Place Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingPlaceId, setEditingPlaceId] = useState<string | null>(null);

  const [placeName, setPlaceName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageStoragePath, setImageStoragePath] = useState('');
  const [startingPrice, setStartingPrice] = useState<number>(10000);
  const [actualWorth, setActualWorth] = useState<number>(25000);
  const [status, setStatus] = useState<'NOT_SOLD' | 'SOLD' | 'WITHDRAWN'>('NOT_SOLD');

  const [uploadingImage, setUploadingImage] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPlaces = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/places?search=${encodeURIComponent(search)}&status=${statusFilter}`);
      const data = await res.json();
      if (data.success) {
        setPlaces(data.places);
      }
    } catch (err) {
      console.error('Error fetching places:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPlaces();
  };

  const openCreateModal = () => {
    setModalMode('create');
    setEditingPlaceId(null);
    setPlaceName('');
    setDescription('');
    setImageUrl('https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200&auto=format&fit=crop');
    setImageStoragePath('');
    setStartingPrice(1000000);
    setActualWorth(2000000);
    setStatus('NOT_SOLD');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (place: IPlace) => {
    setModalMode('edit');
    setEditingPlaceId(place._id);
    setPlaceName(place.placeName);
    setDescription(place.description);
    setImageUrl(place.imageUrl);
    setImageStoragePath(place.imageStoragePath || '');
    setStartingPrice(place.startingPrice);
    setActualWorth(place.actualWorth || 0);
    setStatus(place.status);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setFormError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Failed to upload image.');
        setUploadingImage(false);
        return;
      }

      setImageUrl(data.publicUrl);
      setImageStoragePath(data.storagePath);
    } catch (err) {
      setFormError('Network error uploading image.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!placeName.trim() || !description.trim() || !imageUrl.trim()) {
      setFormError('Place name, description, and an image are required.');
      return;
    }

    if (startingPrice < 0 || actualWorth < 0) {
      setFormError('Prices and actual worth must be non-negative values.');
      return;
    }

    setFormSubmitting(true);

    try {
      const url = modalMode === 'create' ? '/api/admin/places' : `/api/admin/places/${editingPlaceId}`;
      const method = modalMode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placeName: placeName.trim(),
          description: description.trim(),
          imageUrl,
          imageStoragePath,
          startingPrice: Number(startingPrice),
          actualWorth: Number(actualWorth),
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Failed to save Japanese place.');
        setFormSubmitting(false);
        return;
      }

      setIsModalOpen(false);
      fetchPlaces();
    } catch (err) {
      setFormError('Network error saving place.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleWithdraw = async (placeId: string) => {
    if (!confirm('Are you sure you want to withdraw this place from the auction?')) return;
    try {
      const res = await fetch(`/api/admin/places/${placeId}`, { method: 'DELETE' });
      if (res.ok) fetchPlaces();
    } catch (err) {
      console.error('Error withdrawing place:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-white">Japanese Places Catalogue</h2>
          <p className="text-sm text-sumi-400">
            Manage landmark photographs, descriptions, starting prices, and confidential actual-worth valuations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={openCreateModal}
            className="bg-torii-600 hover:bg-torii-700 text-white font-semibold shadow-glow-torii"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Japanese Place
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchPlaces}
            disabled={loading}
            className="border-sumi-700 hover:bg-sumi-800 text-sumi-200"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <Card className="border-sumi-800 bg-sumi-900/60 p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <form onSubmit={handleSearch} className="flex-1 w-full flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-sumi-400" />
              <Input
                placeholder="Search places by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-sumi-950 border-sumi-700 text-white"
              />
            </div>
            <Button type="submit" variant="secondary" className="bg-sumi-800 text-white hover:bg-sumi-700">
              Search
            </Button>
          </form>

          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {['ALL', 'NOT_SOLD', 'SOLD', 'WITHDRAWN'].map((st) => (
              <Button
                key={st}
                size="sm"
                variant={statusFilter === st ? 'default' : 'outline'}
                onClick={() => setStatusFilter(st)}
                className={`text-xs ${
                  statusFilter === st
                    ? 'bg-torii-600 text-white'
                    : 'border-sumi-800 text-sumi-400 hover:bg-sumi-800 hover:text-white'
                }`}
              >
                {st}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Places Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {places.length === 0 ? (
          <div className="col-span-full py-16 text-center text-sumi-400">
            {loading ? 'Loading Japanese places...' : 'No places found. Click "Add Japanese Place" to register an auction item.'}
          </div>
        ) : (
          places.map((place) => (
            <Card
              key={place._id}
              className="border-sumi-800 bg-sumi-900/80 overflow-hidden shadow-sumi-md flex flex-col justify-between hover:border-sumi-700 transition-colors"
            >
              <div>
                {/* Place Photo */}
                <div className="relative h-48 w-full bg-sumi-950 overflow-hidden">
                  <img
                    src={place.imageUrl}
                    alt={place.placeName}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge
                      variant={
                        place.status === 'NOT_SOLD'
                          ? 'available'
                          : place.status === 'SOLD'
                          ? 'sold'
                          : 'withdrawn'
                      }
                      className="shadow-md"
                    >
                      {place.status}
                    </Badge>
                  </div>
                </div>

                {/* Place Info */}
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-lg text-white font-serif">{place.placeName}</CardTitle>
                  <CardDescription className="text-xs text-sumi-400 line-clamp-2">
                    {place.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-4 pt-0 space-y-3">
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-sumi-950 border border-sumi-800 text-xs">
                    <div>
                      <span className="text-sumi-500">Starting Price</span>
                      <div className="font-serif font-bold text-sm text-white">
                        {formatCurrency(place.startingPrice)}
                      </div>
                    </div>
                    <div>
                      <span className="text-kiniro-500 flex items-center gap-1 font-semibold">
                        <ShieldCheck className="h-3 w-3" /> Actual Worth
                      </span>
                      <div className="font-serif font-bold text-sm text-kiniro-400">
                        {formatCurrency(place.actualWorth)}
                      </div>
                    </div>
                  </div>

                  {place.status === 'SOLD' && (
                    <div className="rounded-lg bg-emerald-950/40 border border-emerald-900/60 p-2 text-xs flex items-center justify-between text-emerald-300">
                      <span>Sold To: <strong>{place.winningTeamName}</strong></span>
                      <span className="font-bold">{formatCurrency(place.finalPurchasePrice)}</span>
                    </div>
                  )}
                </CardContent>
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-0 border-t border-sumi-800/80 flex items-center justify-between mt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEditModal(place)}
                  className="border-sumi-700 hover:bg-sumi-800 text-xs text-sumi-300 h-8"
                >
                  <Edit2 className="h-3 w-3 mr-1" />
                  Edit
                </Button>

                {place.status !== 'SOLD' && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleWithdraw(place._id)}
                    className="text-xs h-8"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Withdraw
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create / Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="border-sumi-800 bg-sumi-900 text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif text-white">
              {modalMode === 'create' ? 'Add New Japanese Place' : `Edit Place: ${placeName}`}
            </DialogTitle>
            <DialogDescription className="text-sumi-400">
              Set landmark details, starting price, and confidential actual-worth valuation.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-4 py-2">
            {formError && (
              <div className="rounded-lg bg-destructive/20 border border-destructive/40 p-3 flex items-start space-x-2 text-sm text-rose-300">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="placeName" className="text-xs text-sumi-300">
                Place Name <span className="text-torii-400">*</span>
              </Label>
              <Input
                id="placeName"
                placeholder="e.g. Mount Fuji, Kinkaku-ji, Himeji Castle"
                value={placeName}
                onChange={(e) => setPlaceName(e.target.value)}
                required
                className="bg-sumi-950 border-sumi-700 text-white"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs text-sumi-300">
                Short Description <span className="text-torii-400">*</span>
              </Label>
              <textarea
                id="description"
                rows={3}
                placeholder="Describe landmark history, location, or cultural significance..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full rounded-lg border border-sumi-700 bg-sumi-950 p-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-torii-500"
              />
            </div>

            {/* Image Upload and URL */}
            <div className="space-y-2">
              <Label className="text-xs text-sumi-300">Place Photograph (Supabase Storage)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://... image URL"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="bg-sumi-950 border-sumi-700 text-white text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="border-sumi-700 hover:bg-sumi-800 text-xs whitespace-nowrap"
                >
                  <Upload className="h-3.5 w-3.5 mr-1" />
                  {uploadingImage ? 'Uploading...' : 'Upload'}
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileUpload}
                />
              </div>

              {imageUrl && (
                <div className="relative h-32 w-full rounded-lg overflow-hidden border border-sumi-800 bg-sumi-950">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* Starting Price & Actual Worth */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1.5">
                <Label htmlFor="startingPrice" className="text-xs text-sumi-300">
                  Starting Price (₹) <span className="text-torii-400">*</span>
                </Label>
                <Input
                  id="startingPrice"
                  type="number"
                  min="0"
                  step="1000"
                  value={startingPrice}
                  onChange={(e) => setStartingPrice(Number(e.target.value))}
                  required
                  className="bg-sumi-950 border-sumi-700 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="actualWorth" className="text-xs text-kiniro-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  Confidential Actual Worth (₹)
                </Label>
                <Input
                  id="actualWorth"
                  type="number"
                  min="0"
                  step="1000"
                  value={actualWorth}
                  onChange={(e) => setActualWorth(Number(e.target.value))}
                  required
                  className="bg-sumi-950 border-kiniro-700 text-kiniro-300"
                />
              </div>
            </div>

            {modalMode === 'edit' && (
              <div className="space-y-1.5">
                <Label className="text-xs text-sumi-300">Auction Status</Label>
                <div className="flex gap-2">
                  {(['NOT_SOLD', 'SOLD', 'WITHDRAWN'] as const).map((st) => (
                    <Button
                      key={st}
                      type="button"
                      size="sm"
                      variant={status === st ? 'default' : 'outline'}
                      onClick={() => setStatus(st)}
                      className={`text-xs ${
                        status === st ? 'bg-torii-600 text-white' : 'border-sumi-800 text-sumi-400'
                      }`}
                    >
                      {st}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="border-sumi-700 hover:bg-sumi-800 text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-torii-600 hover:bg-torii-700 text-white font-semibold"
                disabled={formSubmitting || uploadingImage}
              >
                {formSubmitting ? 'Saving...' : 'Save Japanese Place'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
