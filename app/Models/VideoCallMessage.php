<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VideoCallMessage extends Model
{
    protected $fillable = [
        'video_call_id',
        'user_id',
        'message'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
