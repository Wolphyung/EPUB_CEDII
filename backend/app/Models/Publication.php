<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Publication extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_publication';

    protected $fillable = [
        'titre','contenu','type','date_publication','source','categorie','statut',
        'fichier','type_fichier','nom_fichier_original','auteur','id_utilisateur', 
        'membre_id','total_reactions','vues'
    ];

    protected $casts = [
        'date_publication' => 'datetime',
    ];

    public function membre()
    {
        return $this->belongsTo(Membre::class, 'membre_id');
    }

    public function utilisateur()
    {
        return $this->belongsTo(User::class, 'id_utilisateur');
    }

    public function reactions()
    {
        return $this->hasMany(PublicationReaction::class, 'publication_id');
    }

    // Relation pour les vues (DÉJÀ PRÉSENTE)
    public function views()
    {
        return $this->hasMany(PublicationView::class, 'publication_id');
    }

    // Accessor pour l'URL complète du fichier
    public function getFichierUrlAttribute()
    {
        if (!$this->fichier) {
            return null;
        }

        if (str_starts_with($this->fichier, 'http')) {
            return $this->fichier;
        }

        return asset('storage/' . $this->fichier);
    }

    public function getTypeFichierFromName($fileName)
    {
        if (!$fileName) return null;

        $extension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

        $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
        $videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];

        if (in_array($extension, $imageExtensions)) {
            return 'image';
        } elseif (in_array($extension, $videoExtensions)) {
            return 'video';
        } else {
            return 'document';
        }
    }

    public function hasFile()
    {
        return !empty($this->fichier);
    }

    public function getFileIcon()
    {
        if (!$this->fichier) return 'fa-file';

        $extension = strtolower(pathinfo($this->fichier, PATHINFO_EXTENSION));

        switch ($extension) {
            case 'pdf':
                return 'fa-file-pdf';
            case 'doc':
            case 'docx':
                return 'fa-file-word';
            case 'xls':
            case 'xlsx':
                return 'fa-file-excel';
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'bmp':
            case 'webp':
                return 'fa-file-image';
            case 'mp4':
            case 'avi':
            case 'mov':
            case 'wmv':
                return 'fa-file-video';
            case 'zip':
            case 'rar':
            case '7z':
                return 'fa-file-archive';
            default:
                return 'fa-file';
        }
    }

    // Méthode pour vérifier si un visiteur a déjà vu cette publication
    public function hasVisitorViewed($visitorId)
    {
        return $this->views()->where('visitor_id', $visitorId)->exists();
    }
}